const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, action, target, details, req) => {
    try {
        const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        await ActivityLog.create({
            user: userId,
            action,
            target,
            details,
            ipAddress
        });
    } catch (error) {
        console.error('Error creating activity log:', error);
    }
};

module.exports = logActivity;
