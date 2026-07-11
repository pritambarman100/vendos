const mongoose = require('mongoose');

const SlotSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, default: "VM-01" },
    slot_number: { type: String, required: true },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    max: { type: Number, default: 20 },
    alertThreshold: { type: Number, default: 0.20 },
    category: { type: String, default: "Drinks" },
    enabled: { type: Boolean, default: true },
    image: { type: String, default: null }, 
    status: { type: String, enum: ["ok", "low", "empty", "off"], default: "empty" },
    dispatch_status: { type: String, enum: ["IDLE", "PENDING", "SUCCESS", "FAILED"], default: "IDLE" },
    last_order_id: { type: String, default: "" },
    offer_type: { type: String, default: null },
    offer_value: { type: String, default: null }
}, { timestamps: true });

// ইনডেক্সিং সেট করা
SlotSchema.index({ machine_id: 1, slot_number: 1 }, { unique: true });

// এই এক্সপোর্ট লাইনটি খুব সাবধানে চেক করবে
const Slot = mongoose.model('Slot', SlotSchema);
module.exports = Slot;