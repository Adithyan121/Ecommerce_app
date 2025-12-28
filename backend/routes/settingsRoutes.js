const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all settings
router.get('/', async (req, res) => {
    try {
        const settings = await Setting.find({});
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });
        res.json(settingsObj);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update settings (Bulk or Single)
router.post('/', protect, admin, async (req, res) => {
    const settings = req.body;
    try {
        for (const [key, value] of Object.entries(settings)) {
            await Setting.findOneAndUpdate(
                { key },
                { key, value },
                { upsert: true, new: true }
            );
        }
        res.json({ message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
