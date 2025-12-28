const mongoose = require('mongoose');

const shippingZoneSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "North America", "Local"
    regions: [{ type: String }], // List of countries or zip codes
    methods: [{
        name: { type: String, required: true }, // e.g., "Standard", "Express"
        type: { type: String, enum: ['flat', 'free', 'weight'], required: true },
        rate: { type: Number, default: 0 },
        minWeight: { type: Number },
        maxWeight: { type: Number },
        estimatedDays: { type: String }
    }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ShippingZone', shippingZoneSchema);
