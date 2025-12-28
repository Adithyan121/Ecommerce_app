const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'order', 'stock', 'system'
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String }, // Link to the relevant resource (e.g., /orders/123)
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
