require('dotenv').config();
const Slot = require('../models/Slot');

// ১. সব স্লটের ডেটা গেট (Fetch) করা
exports.getSlots = async (req, res) => {
    try {
        const machine_id = req.query.machine_id || req.params.machine_id;
        if (!machine_id) {
            return res.status(400).json({ success: false, message: "Machine ID is required!" });
        }
        const slots = await Slot.find({ machine_id });
        res.status(200).json({ success: true, count: slots.length, data: slots });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ২. স্লট তৈরি বা আপডেট করা
exports.updateSlot = async (req, res) => {
    try {
        const {
            slot_number,
            name,
            price,
            stock,
            max,
            alertThreshold,
            category,
            enabled,
            image,
            machine_id,
            offer_type,
            offer_value
        } = req.body;
        
        if (!slot_number) {
            return res.status(400).json({ success: false, message: "Slot number is required!" });
        }

        if (!machine_id) {
            return res.status(400).json({ success: false, message: "Machine ID is required!" });
        }

        const isEnabled = enabled === 'true' || enabled === true || enabled === '1' || enabled === 1;

        let finalImageUrl = image || null;
        if (finalImageUrl === 'null' || finalImageUrl === '' || finalImageUrl === 'undefined') {
            finalImageUrl = null;
        }

        // Clean absolute domains from saved database urls to keep relative paths
        if (finalImageUrl && finalImageUrl.includes('/uploads/')) {
            finalImageUrl = finalImageUrl.substring(finalImageUrl.indexOf('/uploads/'));
        }

        const numericStock = Number(stock) || 0;
        const numericMax = Number(max) || 20;
        const numericThreshold = Number(alertThreshold) || 0.20;

        let status = req.body.status;
        if (!status) {
            status = 'ok';
            if (!isEnabled) {
                status = 'off';
            } else if (numericStock === 0) {
                status = 'empty';
            } else if (numericStock <= (numericMax * numericThreshold)) {
                status = 'low';
            }
        }
        
        const updatedSlot = await Slot.findOneAndUpdate(
            { machine_id, slot_number: slot_number.toUpperCase() },
            {
                name,
                price: Number(price) || 0,
                stock: numericStock,
                max: numericMax,
                alertThreshold: numericThreshold,
                category: category || 'Other',
                enabled: isEnabled,
                image: finalImageUrl,
                status,
                offer_type: offer_type || null,
                offer_value: offer_value || null,
                dispatch_status: "IDLE"
            },
            { new: true, upsert: true } 
        );
        res.status(200).json({ success: true, message: "Slot configured successfully", data: updatedSlot });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const Machine = require('../models/Machine');

// ৩. মেশিন কার্ডগুলোর রিঅর্ডার সেভ করা (Drag and Drop reordering)
exports.reorderMachines = async (req, res) => {
    try {
        const { orderedIds } = req.body;
        if (!Array.isArray(orderedIds)) {
            return res.status(400).json({ success: false, message: "orderedIds must be an array of machine IDs" });
        }
        
        // Update orderIndex for each machine
        const bulkOps = orderedIds.map((machine_id, index) => ({
            updateOne: {
                filter: { machine_id },
                update: { orderIndex: index }
            }
        }));
        
        await Machine.bulkWrite(bulkOps);
        res.status(200).json({ success: true, message: "Machines reordered successfully" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ৪. মেশিনের সেটিংস আপডেট করা (PUT /api/admin/machines/:id)
exports.updateMachineSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, location, status, upi_id } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Machine ID parameter is required" });
        }

        const existingMachine = await Machine.findOne({ machine_id: id });
        if (!existingMachine) {
            return res.status(404).json({ success: false, message: `Machine ${id} not found` });
        }

        const updatedMachine = await Machine.findOneAndUpdate(
            { machine_id: id },
            { name, location, status: status || 'online', upi_id: upi_id || 'owner@upi' },
            { new: true }
        );

        res.status(200).json({ success: true, message: `Machine ${id} updated successfully!`, data: updatedMachine });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ৫. মেশিন ডিকমিশন করা (DELETE /api/admin/machines/:id)
exports.decommissionMachine = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Machine ID parameter is required" });
        }

        await Machine.deleteOne({ machine_id: id });
        await Slot.deleteMany({ machine_id: id });
        
        const Sale = require('../models/Sale');
        await Sale.deleteMany({ machine_id: id });

        res.status(200).json({ success: true, message: `Machine ${id} decommissioned successfully!` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};