const Notification = require('../models/Notification');

const notifyAdmin = async (type, message, link) => {
    try {
        await Notification.create({
            type,
            message,
            link
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

module.exports = notifyAdmin;
