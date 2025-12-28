const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { protect, admin } = require('../middleware/authMiddleware');
const logActivity = require('../utils/activityLogger');

// Get all products
router.get('/', async (req, res) => {
    try {
        let queryObj = {};

        // Search Keyword
        if (req.query.keyword) {
            queryObj.$or = [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { sku: { $regex: req.query.keyword, $options: 'i' } },
                { 'variants.options.sku': { $regex: req.query.keyword, $options: 'i' } },
                { tags: { $regex: req.query.keyword, $options: 'i' } },
                { category: { $regex: req.query.keyword, $options: 'i' } },
                { description: { $regex: req.query.keyword, $options: 'i' } }
            ];
        }

        // Category Filter
        if (req.query.category) {
            queryObj.category = req.query.category;
        }

        let query = Product.find(queryObj);

        // Sorting
        if (req.query.sort) {
            // e.g., 'price', '-price', 'name', 'category'
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt'); // Default new to old
        }

        const products = await query;
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get related products
router.get('/related/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const related = await Product.find({
                category: product.category,
                _id: { $ne: product._id }
            }).limit(4);
            res.json(related);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            // Fetch reviews for this product
            const Review = require('../models/Review');
            const reviews = await Review.find({ product: req.params.id });

            // Convert to object to attach reviews
            const productObj = product.toObject();
            productObj.reviews = reviews;

            res.json(productObj);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

// Import products from CSV (Admin only)
router.post('/import', protect, admin, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Map CSV fields to Product schema 
                const products = results.map(row => ({
                    name: row.name,
                    description: row.description || '',
                    price: Number(row.price) || 0,
                    stock: Number(row.stock) || 0,
                    category: row.category || 'Uncategorized',
                    sku: row.sku,
                    // Handle comma-separated images if present
                    images: row.images ? row.images.split('|') : [],
                    tags: row.tags ? row.tags.split(',') : []
                }));

                await Product.insertMany(products);

                // Cleanup
                fs.unlinkSync(req.file.path);

                await logActivity(req.user._id, 'Imported Products', `Imported ${products.length} products`, {}, req);

                res.status(201).json({ message: 'Products imported successfully', count: products.length });
            } catch (error) {
                console.error("Import error", error);
                res.status(500).json({ message: 'Error processing file' });
            }
        });
});

// Create product (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const product = new Product(req.body);
        const createdProduct = await product.save();

        // Log Activity
        await logActivity(req.user._id, 'Created Product', `Product ID: ${createdProduct._id}`, req.body, req);

        // Log Initial Inventory
        if (createdProduct.stock > 0) {
            await InventoryLog.create({
                product: createdProduct._id,
                user: req.user._id,
                changeType: 'restock',
                quantityChange: createdProduct.stock,
                previousStock: 0,
                newStock: createdProduct.stock,
                reason: 'Initial stock'
            });
        }

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            await logActivity(req.user._id, 'Deleted Product', `Product ID: ${req.params.id}`, {}, req);
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update product
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            const previousStock = product.stock;

            Object.assign(product, req.body);
            const updatedProduct = await product.save();

            // Log Activity
            await logActivity(req.user._id, 'Updated Product', `Product ID: ${updatedProduct._id}`, req.body, req);

            // Check for stock change
            if (req.body.stock !== undefined && req.body.stock !== previousStock) {
                const change = req.body.stock - previousStock;
                await InventoryLog.create({
                    product: updatedProduct._id,
                    user: req.user._id,
                    changeType: change > 0 ? 'restock' : 'adjustment',
                    quantityChange: change,
                    previousStock: previousStock,
                    newStock: updatedProduct.stock,
                    reason: 'Admin update'
                });
            }

            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
