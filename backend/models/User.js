const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    addresses: [{
        street: String,
        city: String,
        state: String,
        zip: String,
        country: String,
        isDefault: { type: Boolean, default: false }
    }],
    role: { type: String, enum: ['user', 'staff', 'admin', 'superAdmin'], default: 'user' },
    assignedWarehouses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }],

    preferences: {
        language: { type: String, default: 'en' },
        theme: { type: String, default: 'dark' },
        scanSound: { type: Boolean, default: true }
    },

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    notes: [{
        text: String,
        date: { type: Date, default: Date.now },
        isAdmin: { type: Boolean, default: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
