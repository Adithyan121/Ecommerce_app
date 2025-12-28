const mongoose = require('mongoose');

const warehouseLocationSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    code: { type: String, required: true }, // e.g., "A-01-02" (Aisle-Rack-Shelf) Main Identifier

    // Detailed Hierarchy
    zone: { type: String }, // e.g., "Cold Storage", "Bulk", "Picking"
    aisle: { type: String },
    rack: { type: String },
    shelf: { type: String },
    bin: { type: String },

    type: {
        type: String,
        enum: ['Pick', 'Reserve', 'Staging', 'Dock', 'Damaged'],
        default: 'Pick'
    },

    capacity: {
        maxWeight: { type: Number },
        maxVolume: { type: Number },
        isFull: { type: Boolean, default: false }
    },

    description: { type: String }
}, { timestamps: true });

// Compound index to ensure location codes are unique within a warehouse
warehouseLocationSchema.index({ warehouseId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('WarehouseLocation', warehouseLocationSchema);
