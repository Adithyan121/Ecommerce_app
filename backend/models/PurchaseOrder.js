const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: String, required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },

    // Status
    status: {
        type: String,
        enum: ['Created', 'Partially Received', 'Received', 'Cancelled'],
        default: 'Created'
    },

    items: [{
        skuId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },
        quantityExpected: { type: Number, required: true },
        quantityReceived: { type: Number, default: 0 },
        isClosed: { type: Boolean, default: false } // If short closed
    }],

    expectedArrivalDate: { type: Date },
    notes: { type: String },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
