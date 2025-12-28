const mongoose = require('mongoose');

const skuSchema = new mongoose.Schema({
    sku: { type: String, required: true, unique: true },
    barcode: { type: String, unique: true, sparse: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    attributes: { type: Map, of: String }, // e.g., { "Size": "XL", "Color": "Red" }

    // WMS Enriched Fields
    unitOfMeasure: { type: String, default: 'Each' }, // e.g., Each, Box, Pallet, kg, m
    minimumStockLevel: { type: Number, default: 0 },
    reorderQuantity: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['Active', 'Discontinued', 'Blocked'],
        default: 'Active'
    },

    costPrice: { type: Number, default: 0 }, // For inventory valuation
    weight: { type: Number, default: 0 }, // in kg
    dimensions: {
        length: { type: Number, default: 0 },
        width: { type: Number, default: 0 },
        height: { type: Number, default: 0 }
    },

    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('SKU', skuSchema);
