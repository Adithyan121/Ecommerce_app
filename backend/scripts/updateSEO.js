const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config(); // Looks for .env in current directory (backend/)

const updateSEO = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const products = await Product.find({});
        console.log(`Found ${products.length} products to update.`);

        for (const product of products) {
            let updated = false;

            // Generate SEO defaults if missing
            if (!product.seo || !product.seo.metaTitle) {
                const metaTitle = `${product.name} - Best Price Online | ShopWave`;
                const metaDescription = product.description
                    ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 155)
                    : `Buy ${product.name} at the best price on ShopWave.`;

                product.seo = {
                    metaTitle,
                    metaDescription,
                    slug: product.seo?.slug // preserve slug if exists
                };
                updated = true;
            }

            // Generate Tags if missing or empty
            if (!product.tags || product.tags.length === 0) {
                const nameKeywords = product.name.toLowerCase().split(' ').filter(word => word.length > 2);
                const categoryTag = product.category ? product.category.toLowerCase() : '';
                const newTags = [...new Set([categoryTag, ...nameKeywords])].filter(t => t);

                product.tags = newTags;
                updated = true;
            }

            if (updated) {
                await product.save();
                console.log(`Updated SEO for: ${product.name}`);
            }
        }

        console.log('SEO Update Complete');
        process.exit();
    } catch (error) {
        console.error('Error updating SEO:', error);
        process.exit(1);
    }
};

updateSEO();
