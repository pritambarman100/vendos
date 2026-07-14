const Slot = require('../models/Slot');
const Machine = require('../models/Machine');
const Sale = require('../models/Sale');
const Setting = require('../models/Setting');

const dispenseQueues = {};

// Helper to format a single Slot document to match client expectations
const formatSlot = (s, req) => {
    let imageUrl = s.image || null;
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
        const host = req ? req.headers.host : 'localhost:5000';
        imageUrl = `http://${host}${imageUrl}`;
    }
    return {
        slot_id: s.slot_number,
        name: s.name || '',
        category: s.category || 'Other',
        price: Number(s.price) || 0,
        stock: Number(s.stock) || 0,
        max_capacity: Number(s.max) || 20,
        alert_threshold: Number(s.alertThreshold) || 0.20,
        status: s.status || 'off',
        image: imageUrl,
        offer_type: s.offer_type || null,
        offer_value: s.offer_value || null,
        enabled: s.enabled ? 1 : 0,
        machine_id: s.machine_id
    };
};

// GET /api/slots
exports.getSlots = async (req, res) => {
    try {
        const machine_id = req.query.machine_id || 'VM-01';
        let slots = await Slot.find({ machine_id });
        
        // Sort slot list naturally (A1, A2... D5) before returning to client
        slots.sort((a, b) => a.slot_number.localeCompare(b.slot_number));
        
        res.status(200).json(slots.map(s => formatSlot(s, req)));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/slots/save
exports.saveSlot = async (req, res) => {
    try {
        const {
            machine_id = 'VM-01',
            slot_id,
            id,
            name,
            price,
            stock,
            max_capacity,
            alert_threshold,
            category,
            offer_type,
            offer_value,
            image,
            enabled
        } = req.body;

        const final_slot_id = slot_id || id;
        if (!final_slot_id) {
            return res.status(400).json({ success: false, message: "Missing slot identifier" });
        }

        // Cloudinary Image Upload Flow
        let finalImageUrl = image;

        const numericStock = Number(stock) || 0;
        const numericMax = Number(max_capacity) || 20;
        const numericThreshold = Number(alert_threshold) || 0.20;

        let status = 'ok';
        if (numericStock === 0) {
            status = 'empty';
        } else if (numericStock <= (numericMax * numericThreshold)) {
            status = 'low';
        }

        const isEnabled = enabled !== undefined ? (enabled === true || enabled === 1) : true;

        const updatedSlot = await Slot.findOneAndUpdate(
            { machine_id, slot_number: final_slot_id.toUpperCase() },
            {
                name,
                price: Number(price) || 0,
                stock: numericStock,
                max: numericMax,
                alertThreshold: numericThreshold,
                category: category || 'Other',
                offer_type: offer_type || null,
                offer_value: offer_value || null,
                image: finalImageUrl || null,
                enabled: isEnabled,
                status: isEnabled ? status : 'off',
                dispatch_status: 'IDLE'
            },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: `Slot ${final_slot_id} saved successfully`, data: formatSlot(updatedSlot, req) });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST/DELETE /api/slots/delete/:slot_id
exports.deleteSlot = async (req, res) => {
    try {
        const { slot_id } = req.params;
        const machine_id = req.query.machine_id || req.body.machine_id || 'VM-01';

        await Slot.deleteOne({ machine_id, slot_number: slot_id.toUpperCase() });
        res.status(200).json({ success: true, message: `Chamber ${slot_id} deleted successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
    try {
        const machine_id = req.query.machine_id || 'VM-01';
        
        const sales = await Sale.find({ machine_id });
        const total_revenue = sales.reduce((sum, s) => sum + (s.price_paid || 0), 0);
        const items_sold = sales.length;

        const slots = await Slot.find({ machine_id });
        const low_slots = slots.filter(s => s.enabled && s.name && s.status === 'low').length;
        const empty_slots = slots.filter(s => s.enabled && s.name && (s.stock === 0 || s.status === 'empty')).length;

        res.status(200).json({
            total_revenue,
            items_sold,
            low_slots,
            empty_slots
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/sales
exports.getSales = async (req, res) => {
    try {
        const { machine_id } = req.query;
        const filter = machine_id ? { machine_id } : {};
        const sales = await Sale.find(filter).sort({ timestamp: -1 });
        res.status(200).json(sales.map(s => ({
            id: s._id,
            slot_id: s.slot_id,
            product_name: s.product_name,
            category: s.category,
            price_paid: s.price_paid,
            timestamp: s.timestamp
        })));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/transactions/process
exports.processTransaction = async (req, res) => {
    try {
        const { machine_id = 'VM-01', slot_id, id, quantity = 1, price_paid } = req.body;
        const final_slot_id = slot_id || id;

        if (!final_slot_id) {
            return res.status(400).json({ success: false, message: "Missing slot identifier" });
        }

        const slot = await Slot.findOne({ machine_id, slot_number: final_slot_id.toUpperCase() });
        if (!slot) {
            return res.status(404).json({ success: false, message: `Slot ${final_slot_id} not found` });
        }

        const current_stock = slot.stock;
        if (current_stock <= 0) {
            return res.status(400).json({ success: false, message: `Slot ${final_slot_id} is out of stock` });
        }

        const qty_purchased = Number(quantity);
        let free_dispense = 0;

        if (slot.offer_type === 'Buy X Get Y Free' && slot.offer_value) {
            try {
                const parts = slot.offer_value.split('+');
                if (parts.length === 2) {
                    const x_val = parseInt(parts[0], 10);
                    const y_val = parseInt(parts[1], 10);
                    if (qty_purchased >= x_val) {
                        const num_sets = Math.floor(qty_purchased / x_val);
                        free_dispense = num_sets * y_val;
                    }
                }
            } catch (e) {
                console.error("Error parsing BXGY offer value:", e);
            }
        }

        const total_dispense = Math.min(current_stock, qty_purchased + free_dispense);
        const new_stock = current_stock - total_dispense;

        let new_status = 'ok';
        if (new_stock === 0) {
            new_status = 'empty';
        } else if (new_stock <= (slot.max * slot.alertThreshold)) {
            new_status = 'low';
        }

        slot.stock = new_stock;
        slot.status = new_status;
        await slot.save();

        const final_price_paid = price_paid !== undefined ? Number(price_paid) : (slot.price * qty_purchased);
        const newSale = new Sale({
            machine_id,
            slot_id: final_slot_id.toUpperCase(),
            product_name: slot.name,
            category: slot.category,
            price_paid: final_price_paid
        });
        await newSale.save();

        if (!dispenseQueues[machine_id]) {
            dispenseQueues[machine_id] = [];
        }
        for (let i = 0; i < total_dispense; i++) {
            dispenseQueues[machine_id].push(final_slot_id.toUpperCase());
        }

        res.status(200).json({
            success: true,
            message: `Transaction processed. Dispensing ${total_dispense} items (Purchased: ${qty_purchased}, Free: ${total_dispense - qty_purchased}). Added to hardware queue.`,
            slot_id: final_slot_id.toUpperCase(),
            new_stock,
            new_status,
            total_dispensed: total_dispense
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/hardware/dispense-queue
exports.getDispenseQueue = async (req, res) => {
    try {
        const machine_id = req.query.machine_id || 'VM-01';
        const queue = dispenseQueues[machine_id] || [];
        if (queue.length > 0) {
            const slot_id = queue.shift();
            res.status(200).json({ dispense: true, slot_id });
        } else {
            res.status(200).json({ dispense: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/system/reset
exports.resetSystem = async (req, res) => {
    try {
        const { password, confirmation_text, machine_id = 'VM-01' } = req.body;

        if (!password || !confirmation_text) {
            return res.status(400).json({ success: false, message: "Missing password or confirmation phrase" });
        }

        const adminPasswordSetting = await Setting.findOne({ key: 'admin_password' });
        const dbPassword = adminPasswordSetting ? adminPasswordSetting.value : 'admin123';

        if (password !== dbPassword) {
            return res.status(401).json({ success: false, message: "Incorrect password" });
        }

        if (confirmation_text !== "RESET VENDOS ENGINE") {
            return res.status(400).json({ success: false, message: "Invalid confirmation phrase" });
        }

        // Delete sales for this machine
        await Sale.deleteMany({ machine_id });
        // Set all stock for this machine to 0 and empty
        await Slot.updateMany({ machine_id }, { stock: 0, status: 'empty' });

        if (dispenseQueues[machine_id]) {
            dispenseQueues[machine_id] = [];
        }

        res.status(200).json({ success: true, message: "Security reset executed successfully. Sales cleared, stocks set to 0." });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET /api/machines
exports.getMachines = async (req, res) => {
    try {
        const machines = await Machine.find({}).sort({ orderIndex: 1 });
        const machinesWithAlerts = await Promise.all(machines.map(async (m) => {
            const slots = await Slot.find({ machine_id: m.machine_id });
            const lowCount = slots.filter(s => s.enabled && s.name && s.status === 'low').length;
            const emptyCount = slots.filter(s => s.enabled && s.name && (s.stock === 0 || s.status === 'empty')).length;
            return {
                ...m.toObject(),
                lowCount,
                emptyCount
            };
        }));
        res.status(200).json(machinesWithAlerts);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST /api/machines/save
exports.saveMachine = async (req, res) => {
    try {
        const { machine_id, name, location, status, upi_id } = req.body;

        if (!machine_id) {
            return res.status(400).json({ success: false, message: "Missing machine identifier (machine_id)" });
        }

        const existingMachine = await Machine.findOne({ machine_id });
        const isNew = !existingMachine;

        const updatedMachine = await Machine.findOneAndUpdate(
            { machine_id },
            { name, location, status: status || 'online', upi_id: upi_id || 'owner@upi' },
            { new: true, upsert: true }
        );

        res.status(200).json({ success: true, message: `Machine ${machine_id} saved successfully!`, data: updatedMachine });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST/DELETE /api/machines/delete/:machine_id
exports.deleteMachine = async (req, res) => {
    try {
        const { machine_id } = req.params;

        await Machine.deleteOne({ machine_id });
        await Slot.deleteMany({ machine_id });
        await Sale.deleteMany({ machine_id });

        if (dispenseQueues[machine_id]) {
            delete dispenseQueues[machine_id];
        }

        res.status(200).json({ success: true, message: `Machine ${machine_id} and all its data deleted successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
