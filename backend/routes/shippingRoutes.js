const express = require('express');
const router = express.Router();
const ShippingZone = require('../models/ShippingZone');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all zones
router.get('/', protect, admin, async (req, res) => {
    try {
        const zones = await ShippingZone.find({});
        res.json(zones);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create zone
router.post('/', protect, admin, async (req, res) => {
    try {
        const zone = new ShippingZone(req.body);
        const savedZone = await zone.save();
        res.status(201).json(savedZone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update zone
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const zone = await ShippingZone.findById(req.params.id);
        if (zone) {
            Object.assign(zone, req.body);
            const updatedZone = await zone.save();
            res.json(updatedZone);
        } else {
            res.status(404).json({ message: 'Zone not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete zone
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const zone = await ShippingZone.findById(req.params.id);
        if (zone) {
            await zone.deleteOne();
            res.json({ message: 'Zone removed' });
        } else {
            res.status(404).json({ message: 'Zone not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
