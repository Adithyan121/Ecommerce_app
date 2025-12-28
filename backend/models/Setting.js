const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., "store_info", "tax_settings"
    value: { type: mongoose.Schema.Types.Mixed, required: true } // Can be object, string, number
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
