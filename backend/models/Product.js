const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true }, // Rich text content
    price: { type: Number, required: true },
    salePrice: { type: Number },
    images: [{ type: String }], // Multiple images
    image: { type: String }, // Main image (backward compatibility or primary thumbnail)
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },

    // Inventory & Shipping
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String },
    stock: { type: Number, required: true, default: 0 },
    trackInventory: { type: Boolean, default: true },
    weight: { type: Number }, // in kg or lbs
    shippingClass: { type: String },

    // Variants
    variants: [{
        name: String, // e.g., "Size", "Color"
        options: [{
            value: String, // e.g., "Red", "XL"
            priceModifier: Number,
            stock: Number,
            sku: String,
            images: [String] // Link specific images to this option (e.g., Color)
        }]
    }],

    // Attributes
    attributes: [{
        key: String, // e.g., "Material"
        value: String // e.g., "Cotton"
    }],

    // SEO
    seo: {
        metaTitle: String,
        metaDescription: String,
        slug: { type: String, unique: true, sparse: true }
    },

    // Visibility
    visibility: { type: String, enum: ['published', 'hidden', 'scheduled'], default: 'published' },
    publishDate: { type: Date },

    // Additional Marketing & Review Data
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    brand: { type: String },
    isFeatured: { type: Boolean, default: false },
    isBestseller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    flashSaleEndDate: { type: Date }, // For countdown timer

    // Content Extras
    highlights: [{ type: String }],
    faqs: [{ question: String, answer: String }],
    returnPolicy: { type: String, default: '30-day return policy' },
    warranty: { type: String, default: '1 year warranty' },

}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
