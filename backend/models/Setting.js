const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true }
});

const Setting = mongoose.model('Setting', SettingSchema);
module.exports = Setting;
