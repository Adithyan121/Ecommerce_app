const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    skuId: { type: mongoose.Schema.Types.ObjectId, ref: 'SKU', required: true },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'WarehouseLocation' }, // Optional: null could mean "General Stock" in warehouse? User said "Bin" so likely required or default. Let's keep optional for now but generally expected.
    quantity: { type: Number, required: true, default: 0 },
    reserved: { type: Number, required: true, default: 0 } // Stock reserved for orders but not yet shipped
}, { timestamps: true });

// Ensure unique inventory record for a specific SKU in a specific location
inventorySchema.index({ skuId: 1, warehouseId: 1, locationId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
