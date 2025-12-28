const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all logs
router.get('/', protect, admin, async (req, res) => {
    try {
        const logs = await InventoryLog.find({})
            .populate('product', 'name sku')
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
