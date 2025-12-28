const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
    skuId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseLocation' },
    type: { type: String, enum: ['IN', 'OUT', 'ADJUST', 'TRANSFER'], required: true },
    quantity: { type: Number, required: true },

    // Tracking
    batchNumber: { type: String },
    expiryDate: { type: Date },

    // Audit Source
    sourceType: { type: String, enum: ['Purchase Order', 'Sales Order', 'Manual', 'Transfer', 'Return'] },
    sourceId: { type: String }, // ID of the PO or Order

    reason: { type: String },
    scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referenceId: { type: String }, // Legacy compatibility
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
