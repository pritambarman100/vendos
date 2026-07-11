const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
    machine_id: { type: String, required: true, unique: true },
    name: { type: String, default: "" },
    location: { type: String, default: "" },
    status: { type: String, enum: ["online", "offline", "maintenance"], default: "online" },
    upi_id: { type: String, default: "owner@upi" },
    orderIndex: { type: Number, default: 0 }
}, { timestamps: true });

const Machine = mongoose.model('Machine', MachineSchema);
module.exports = Machine;
