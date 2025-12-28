const express = require('express');
const router = express.Router();
const Page = require('../models/Page');
const { protect, admin } = require('../middleware/authMiddleware');

// Get all pages
router.get('/', async (req, res) => {
    try {
        const pages = await Page.find({});
        res.json(pages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get page by slug
router.get('/:slug', async (req, res) => {
    try {
        const page = await Page.findOne({ slug: req.params.slug });
        if (page) {
            res.json(page);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create page
router.post('/', protect, admin, async (req, res) => {
    try {
        const { slug } = req.body;
        const pageExists = await Page.findOne({ slug });
        if (pageExists) {
            return res.status(400).json({ message: 'Page with this slug already exists' });
        }
        const page = new Page(req.body);
        const createdPage = await page.save();
        res.status(201).json(createdPage);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update page
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (page) {
            page.title = req.body.title || page.title;
            page.slug = req.body.slug || page.slug;
            page.content = req.body.content || page.content;
            page.metaTitle = req.body.metaTitle || page.metaTitle;
            page.metaDescription = req.body.metaDescription || page.metaDescription;
            page.isPublished = req.body.isPublished !== undefined ? req.body.isPublished : page.isPublished;

            const updatedPage = await page.save();
            res.json(updatedPage);
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete page
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (page) {
            await page.deleteOne();
            res.json({ message: 'Page removed' });
        } else {
            res.status(404).json({ message: 'Page not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
