const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/dashboard/overview
router.get('/overview', protect, admin, async (req, res) => {
    try {
        // --- 1. Total Counts & Revenue ---
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const outOfStockCount = await Product.countDocuments({ stock: { $lte: 5 } });

        const financialStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: {
                        $sum: { $cond: [{ $eq: ["$isPaid", true] }, "$totalPrice", 0] }
                    },
                    totalRefunds: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "Refunded"] }, "$itemsPrice", 0] } // Approximate refund value
                    },
                    refundCount: {
                        $sum: { $cond: [{ $eq: ["$orderStatus", "Refunded"] }, 1, 0] }
                    }
                }
            }
        ]);

        const stats = {
            orders: totalOrders,
            products: totalProducts,
            users: totalUsers,
            outOfStock: outOfStockCount,
            revenue: financialStats[0]?.totalRevenue || 0,
            refunds: financialStats[0]?.totalRefunds || 0,
            refundCount: financialStats[0]?.refundCount || 0
        };

        // --- 2. Sales Summary (Daily/Weekly/Monthly) ---
        // Daily (Last 7 Days)
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        const dailySales = await Order.aggregate([
            { $match: { createdAt: { $gte: last7Days }, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Weekly (Last 4 Weeks) - Simplified
        // Monthly (Last 12 Months)
        const last12Months = new Date();
        last12Months.setMonth(last12Months.getMonth() - 11);
        const monthlySales = await Order.aggregate([
            { $match: { createdAt: { $gte: last12Months }, isPaid: true } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                    total: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // --- 3. Top Selling Products ---
        const topProducts = await Order.aggregate([
            { $unwind: "$orderItems" },
            {
                $group: {
                    _id: "$orderItems.product",
                    name: { $first: "$orderItems.name" },
                    sold: { $sum: "$orderItems.qty" },
                    revenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.qty"] } }
                }
            },
            { $sort: { sold: -1 } },
            { $limit: 5 }
        ]);

        // --- 4. Low Stock Alerts ---
        const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
            .select('name stock price image')
            .limit(5);

        // --- 5. New Customer Signups ---
        const newUsers = await User.find()
            .select('name email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // --- 6. Recent Activity ---
        const recentActivity = await ActivityLog.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        // Just in case ActivityLog is empty, provide recent orders as fallback activity in frontend if desired, 
        // but here we just return what we query.

        res.json({
            stats,
            salesData: { daily: dailySales, monthly: monthlySales },
            topProducts,
            lowStockProducts,
            newUsers,
            recentActivity
        });

    } catch (error) {
        console.error("Dashboard Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
