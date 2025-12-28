const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all coupons (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await Coupon.find({});
        res.json(coupons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Validate coupon (Public/User)
router.post('/validate', async (req, res) => {
    const { code, cartTotal } = req.body;
    try {
        const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        if (new Date() > coupon.expiryDate) {
            return res.status(400).json({ message: 'Coupon expired' });
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ message: 'Coupon usage limit reached' });
        }

        if (cartTotal < coupon.minOrderValue) {
            return res.status(400).json({ message: `Minimum order value of ${coupon.minOrderValue} required` });
        }

        res.json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create coupon (Admin)
router.post('/', protect, admin, async (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        const savedCoupon = await coupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete coupon (Admin)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        if (coupon) {
            await coupon.deleteOne();
            res.json({ message: 'Coupon removed' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
