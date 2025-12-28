const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant: { type: String }, // Optional variant name
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Admin who changed it
    changeType: { type: String, enum: ['restock', 'sale', 'adjustment', 'return'], required: true },
    quantityChange: { type: Number, required: true }, // +10 or -5
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
