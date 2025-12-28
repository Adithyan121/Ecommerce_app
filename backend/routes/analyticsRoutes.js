const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Get Dashboard Stats
router.get('/dashboard', protect, admin, async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalCustomers = await User.countDocuments({ isAdmin: false });

        res.json({
            sales: totalSales[0]?.total || 0,
            orders: totalOrders,
            products: totalProducts,
            customers: totalCustomers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
