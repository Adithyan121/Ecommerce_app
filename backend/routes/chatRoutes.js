const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get chat history for a user (or for admin viewing a user)
// @route   GET /api/chat/history/:userId
// @access  Private
router.get('/history/:userId', protect, async (req, res) => {
    try {
        const userId = req.params.userId;

        // Security check: only allow the user themselves or an admin/staff/superadmin to access this
        if (req.user._id.toString() !== userId &&
            !req.user.isAdmin &&
            !['admin', 'staff', 'superadmin'].includes(req.user.role)) {
            return res.status(401).json({ message: 'Not authorized to view this chat history' });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Save a new message
// @route   POST /api/chat
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { text, receiver, isAdmin } = req.body;

        // If it's a customer sending, sender is req.user._id, receiver is likely null (admin pool) or specific
        // If it's admin sending, sender is req.user._id, receiver is the user

        const messageData = {
            sender: req.user._id,
            text,
            isAdmin: isAdmin || req.user.isAdmin || req.user.role === 'admin' || req.user.role === 'superadmin'
        };

        if (receiver) {
            messageData.receiver = receiver;
        }

        const message = await Message.create(messageData);
        res.status(201).json(message);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all active conversations (for admin dashboard)
// @route   GET /api/chat/conversations
// @access  Admin/Staff
router.get('/conversations', protect, admin, async (req, res) => {
    try {
        // Aggregate to find unique users who have sent messages
        // distinct senders where isAdmin is false
        const userIds = await Message.find({ isAdmin: false }).distinct('sender');

        // You might want to populate user details here or fetch them
        // For now just return the IDs or fetch latest message for each
        res.json(userIds);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
