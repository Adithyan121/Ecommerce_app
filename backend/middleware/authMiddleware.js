const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Determine which model to query based on role in token or try all?
            // Ideally, token should have role. If not (legacy), try User.
            const role = decoded.role || 'user';

            if (role === 'superadmin') {
                req.user = await SuperAdmin.findById(decoded.id).select('-password');
            } else if (role === 'admin') {
                req.user = await Admin.findById(decoded.id).select('-password');
            } else if (role === 'staff') {
                req.user = await Staff.findById(decoded.id).select('-password');
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }

            // Fallback: if token has role but user not found in that collection, maybe they were moved?
            // For now, strict check.

            if (!req.user) {
                // Legacy support: Check User collection if not found above (e.g., token had no role but implied user)
                if (!decoded.role) {
                    req.user = await User.findById(decoded.id).select('-password');
                }
            }

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Standardize role property for easy checking
            if (!req.user.role) {
                if (req.user.isAdmin) req.user.role = 'admin'; // Legacy
                else req.user.role = 'user';
            }

            if (req.user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            next();
        } catch (error) {
            console.error(`Auth Error in ${req.method} ${req.originalUrl}:`, error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const staff = (req, res, next) => {
    // Allows Staff, Admin, SuperAdmin
    if (req.user && (req.user.role === 'staff' || req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as staff' });
    }
};

const admin = (req, res, next) => {
    // Allows Admin, SuperAdmin
    if (req.user && (req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin)) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const superAdmin = (req, res, next) => {
    // Allows ONLY SuperAdmin
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as super admin' });
    }
};

module.exports = { protect, staff, admin, superAdmin };
