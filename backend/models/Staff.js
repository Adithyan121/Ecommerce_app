const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'staff' },
    isBlocked: { type: Boolean, default: false },
    permissions: [{ type: String }], // e.g. 'manage_products', 'manage_orders'
    assignedWarehouses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' }],
    preferences: {
        language: { type: String, default: 'en' },
        theme: { type: String, default: 'dark' },
        scanSound: { type: Boolean, default: true }
    }
}, { timestamps: true });

staffSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

staffSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);
