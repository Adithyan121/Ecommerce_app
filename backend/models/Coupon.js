const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percentage', 'fixed'], required: true },
    value: { type: Number, required: true }, // Amount off or percentage off
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number }, // For percentage coupons
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null }, // Global limit
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
