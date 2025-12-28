const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    // Content
    title: { type: String, required: true },
    subtitle: { type: String },
    description: { type: String },
    btnText: { type: String, default: 'Shop Now' },
    link: { type: String, default: '/shop' },
    image: { type: String, required: true },

    // Colors - Background
    bgGradientStart: { type: String, default: '#8FD3F4' },
    bgGradientEnd: { type: String, default: '#a2d9ff' },

    // Colors - Text
    titleColor: { type: String, default: '#ffffff' },
    subtitleColor: { type: String, default: '#5d67a6' },
    descColor: { type: String, default: '#ffffff' },

    // Buttons
    btnBgColor: { type: String, default: '#7b8de6' }, // For solid or gradient start
    btnTextColor: { type: String, default: '#ffffff' },
    btnRadius: { type: Number, default: 30 },

    // Bottom Thumbnails Configuration
    showThumbnails: { type: Boolean, default: true },
    thumbnails: [
        {
            image: { type: String },
            title: { type: String, default: 'Product Name' },
            price: { type: String, default: '$0' }
        }
    ],

    // Meta
    position: { type: String, enum: ['home-slider', 'home-middle', 'sidebar'], default: 'home-slider' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
