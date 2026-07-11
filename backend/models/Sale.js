const mongoose = require('mongoose');

const SaleSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, default: "VM-01" },
    slot_id: { type: String, required: true },
    product_name: { type: String, default: "" },
    category: { type: String, default: "Other" },
    price_paid: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

const Sale = mongoose.model('Sale', SaleSchema);
module.exports = Sale;
