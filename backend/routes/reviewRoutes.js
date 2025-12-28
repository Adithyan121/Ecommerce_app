const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all reviews (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const reviews = await Review.find({}).populate('product', 'name').populate('user', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get reviews by User ID (Admin)
router.get('/user/:id', protect, admin, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.params.id }).populate('product', 'name');
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create review (User)
router.post('/:productId', protect, async (req, res) => {
    const { rating, comment } = req.body;
    try {
        const product = await Product.findById(req.params.productId);

        if (product) {
            const alreadyReviewed = await Review.findOne({
                product: req.params.productId,
                user: req.user._id
            });

            if (alreadyReviewed) {
                return res.status(400).json({ message: 'Product already reviewed' });
            }

            const review = new Review({
                name: req.user.name,
                rating: Number(rating),
                comment,
                user: req.user._id,
                product: product._id,
            });

            await review.save();

            // Recalculate Rating & NumReviews
            const reviews = await Review.find({ product: req.params.productId });
            product.numReviews = reviews.length;
            product.rating = reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length;

            await product.save();

            res.status(201).json({ message: 'Review added' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete review (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (review) {
            await review.deleteOne();
            res.json({ message: 'Review removed' });
        } else {
            res.status(404).json({ message: 'Review not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
