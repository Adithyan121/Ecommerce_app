const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const seedProducts = require('../data/products');

dotenv.config();

const updateTags = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        for (const seedProduct of seedProducts) {
            if (seedProduct.tags && seedProduct.tags.length > 0) {
                // Find by SKU if available, else Name
                let query = {};
                if (seedProduct.sku) {
                    query = { sku: seedProduct.sku };
                } else {
                    query = { name: seedProduct.name };
                }

                const product = await Product.findOne(query);
                if (product) {
                    // Update tags
                    // Merge with existing tags if any, to avoid losing auto-generated ones? 
                    // Or overwrite? User asked to "add tags here". 
                    // Let's merge unique.
                    const existingTags = product.tags || [];
                    const newTags = seedProduct.tags;
                    const mergedTags = [...new Set([...existingTags, ...newTags])];

                    product.tags = mergedTags;
                    await product.save();
                    console.log(`Updated tags for: ${product.name} -> [${mergedTags.join(', ')}]`);
                } else {
                    console.log(`Product not found (skip): ${seedProduct.name}`);
                }
            }
        }

        console.log('Tags Update Complete');
        process.exit();
    } catch (error) {
        console.error('Error updating tags:', error);
        process.exit(1);
    }
};

updateTags();
