const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Staff member
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variant: { type: mongoose.Schema.Types.Mixed }, // Changed from String to Mixed to allow objects
            sku: { type: String }
        }
    ],
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String },
        deliveryType: { type: String, default: 'Standard' }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String },
    },

    // Financials
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    discountPrice: { type: Number, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },

    // Statuses
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },

    orderStatus: {
        type: String,
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
        default: 'Pending'
    },

    // Shipping & Tracking
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    shippedAt: { type: Date },
    trackingNumber: { type: String },
    courier: { type: String },

    pickStatus: {
        type: String,
        enum: ['Pending', 'In Progress', 'Picked', 'Packed', 'Shipped'],
        default: 'Pending'
    },

    // Timeline
    timeline: [
        {
            status: String,
            date: { type: Date, default: Date.now },
            note: String
        }
    ],

    // Admin & Notes
    notes: [{
        text: String,
        date: { type: Date, default: Date.now },
        isAdmin: { type: Boolean, default: true }
    }],

    // Refund
    refundResult: {
        id: String,
        status: String,
        amount: Number,
        date: Date
    }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
