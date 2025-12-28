const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    image: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Middleware to create slug from name
categorySchema.pre('save', function (next) {
    if (this.name && !this.slug) {
        this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }
    next();
});

module.exports = mongoose.model('Category', categorySchema);
