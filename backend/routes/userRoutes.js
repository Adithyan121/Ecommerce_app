const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Staff = require('../models/Staff');
const Admin = require('../models/Admin');
const SuperAdmin = require('../models/SuperAdmin');
const notifyAdmin = require('../utils/notificationSender');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { protect, admin, staff, superAdmin } = require('../middleware/authMiddleware');

const generateToken = (id, role = 'user') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Register User (User Collection Only)
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    console.log('Register attempt:', { name, email }); // Debug log

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.log('User already exists');
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        if (user) {
            // Create Notification
            await notifyAdmin('info', `New user registered: ${user.name} (${user.email})`, `/customers/${user._id}`);

            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                role: 'user',
                token: generateToken(user._id, 'user'),
            });
        } else {
            console.log('Invalid user data');
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Login User (Searches All Collections)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null;
        let role = 'user';

        // Check Super Admin
        user = await SuperAdmin.findOne({ email });
        if (user) role = 'superadmin';

        // Check Admin
        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = 'admin';
        }

        // Check Staff
        if (!user) {
            user = await Staff.findOne({ email });
            if (user) role = 'staff';
        }

        // Check User (Customer)
        if (!user) {
            user = await User.findOne({ email });
            if (user) role = 'user';
        }

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            // Standardize response
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || role,
                isAdmin: role === 'admin' || role === 'superadmin' || user.isAdmin, // Backward compat
                token: generateToken(user._id, user.role || role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Login (Strictly for Admin Panel - Admin/SuperAdmin only)
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null;
        let role = '';

        // Check Super Admin
        user = await SuperAdmin.findOne({ email });
        if (user) role = 'superadmin';

        // Check Admin
        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = 'admin';
        }

        // REMOVED Staff check - Staff cannot login to Admin Panel

        // Do NOT check User collection

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || role,
                isAdmin: true, // Always true for this endpoint users
                token: generateToken(user._id, user.role || role),
            });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Staff Login (Strictly for Warehouse Ops - Staff/Admin/SuperAdmin only)
router.post('/staff-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = null;
        let role = '';

        // Check Super Admin
        user = await SuperAdmin.findOne({ email });
        if (user) role = 'superadmin';

        // Check Admin
        if (!user) {
            user = await Admin.findOne({ email });
            if (user) role = 'admin';
        }

        // Check Staff
        if (!user) {
            user = await Staff.findOne({ email });
            if (user) role = 'staff';
        }

        // Do NOT check User (Customer) collection

        if (user && (await bcrypt.compare(password, user.password))) {
            if (user.isBlocked) {
                return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || role,
                isAdmin: role === 'admin' || role === 'superadmin',
                token: generateToken(user._id, user.role || role),
            });
        } else {
            res.status(401).json({ message: 'Invalid staff credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User Profile
router.get('/profile', protect, async (req, res) => {
    let user = req.user;
    if (user) {
        // Populate if field exists (mongoose populate works on document)
        if (user.assignedWarehouses && user.assignedWarehouses.length > 0) {
            await user.populate('assignedWarehouses', 'name code');
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            role: user.role,
            assignedWarehouses: user.assignedWarehouses || [],
            preferences: user.preferences
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Update User Profile
router.put('/profile', protect, async (req, res) => {
    try {
        const user = req.user; // Use the user object from middleware

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            // Add phone update if present, as Admins have phone
            if (req.body.phone) user.phone = req.body.phone;
            if (req.body.preferences) {
                user.preferences = { ...user.preferences, ...req.body.preferences };
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                isAdmin: updatedUser.isAdmin,
                role: updatedUser.role,
                assignedWarehouses: updatedUser.assignedWarehouses || [],
                preferences: updatedUser.preferences,
                token: generateToken(updatedUser._id, updatedUser.role),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all users (Customers) - Accessible by Staff+
router.get('/', protect, staff, async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all Staff - Accessible by Admin+
router.get('/type/staff', protect, admin, async (req, res) => {
    try {
        const staff = await Staff.find({});
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all Admins - Accessible by Admin+
router.get('/type/admins', protect, admin, async (req, res) => {
    try {
        const admins = await Admin.find({});
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all Super Admins - Accessible by Super Admin only
router.get('/type/superadmins', protect, superAdmin, async (req, res) => {
    try {
        const superadmins = await SuperAdmin.find({});
        res.json(superadmins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Seed Temporary Data (Dev only)
router.post('/seed-data', async (req, res) => {
    try {
        // Clear existing (optional, maybe just add if not exist)
        // await Admin.deleteMany({});
        // await Staff.deleteMany({});
        // await SuperAdmin.deleteMany({});

        const pwd = await bcrypt.hash('123456', 10);

        if (await Admin.countDocuments() === 0) {
            await Admin.create([
                { name: 'Alice Admin', email: 'alice@admin.com', password: pwd },
                { name: 'Bob Admin', email: 'bob@admin.com', password: pwd }
            ]);
        }

        if (await Staff.countDocuments() === 0) {
            await Staff.create([
                { name: 'Sarah Staff', email: 'sarah@staff.com', password: pwd, permissions: ['orders'] },
                { name: 'Steve Staff', email: 'steve@staff.com', password: pwd, permissions: ['products'] }
            ]);
        }

        if (await SuperAdmin.countDocuments() === 0) {
            await SuperAdmin.create([
                { name: 'Super Mario', email: 'mario@super.com', password: pwd }
            ]);
        }

        res.json({ message: 'Seeded successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete user (SuperAdmin only for Staff/Admins, Admin for Users)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            // Check higher privileges for deleting Staff/Admin
            if (req.user.role === 'superadmin') {
                const s = await Staff.findById(req.params.id);
                if (s) { await s.deleteOne(); return res.json({ message: 'Staff removed' }); }
                const a = await Admin.findById(req.params.id);
                if (a) { await a.deleteOne(); return res.json({ message: 'Admin removed' }); }
            }
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get User by ID - Staff+
router.get('/:id', protect, staff, async (req, res) => {
    try {
        let user = await User.findById(req.params.id).select('-password');
        if (!user) user = await Staff.findById(req.params.id).select('-password');
        if (!user && (req.user.role === 'admin' || req.user.role === 'superadmin')) user = await Admin.findById(req.params.id).select('-password');
        if (!user && req.user.role === 'superadmin') user = await SuperAdmin.findById(req.params.id).select('-password');

        if (user) {
            // Add temporary role field if likely missing (though schema has default)
            // Flatten object to inject dynamic role if needed
            const userData = user.toObject();
            if (!userData.role) {
                if (userData.isAdmin) userData.role = 'admin';
                else userData.role = 'user';
            }
            res.json(userData);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update User (Admin) - Update in correct collection
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, email, isAdmin, phone, role } = req.body;
        let user = await User.findById(req.params.id);
        let collection = User;

        if (!user) {
            user = await Staff.findById(req.params.id);
            collection = Staff;
        }
        if (!user) {
            user = await Admin.findById(req.params.id);
            collection = Admin;
        }
        if (!user && req.user.role === 'superadmin') {
            user = await SuperAdmin.findById(req.params.id);
            collection = SuperAdmin;
        }

        if (user) {
            user.name = name || user.name;
            user.email = email || user.email;
            user.phone = phone || user.phone;

            // Only update isAdmin for User/Admin types mostly, but fields vary
            if (isAdmin !== undefined) user.isAdmin = isAdmin;

            // If it's staff, maybe update permissions?
            if (collection === Staff && req.body.permissions) {
                user.permissions = req.body.permissions;
            }

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role || (updatedUser.isAdmin ? 'admin' : 'user')
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ban/Unban User (Admin)
router.put('/:id/ban', protect, admin, async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user) user = await Staff.findById(req.params.id);
        if (!user && req.user.role === 'superadmin') user = await Admin.findById(req.params.id);

        if (user) {
            user.isBlocked = !user.isBlocked;
            const updatedUser = await user.save();
            res.json({ message: `User ${updatedUser.isBlocked ? 'Blocked' : 'Unblocked'}`, isBlocked: updatedUser.isBlocked });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Internal Note (Admin)
router.post('/:id/note', protect, admin, async (req, res) => {
    const { text } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.notes.push({
                text,
                isAdmin: true
            });
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Admin (Admin/SuperAdmin only)
router.post('/add-admin', protect, admin, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if exists in any collection to avoid confusion? or just Admin?
        // Let's just check Admin for now
        const existing = await Admin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Admin already exists' });

        const newAdmin = await Admin.create({
            name, email, password, phone
        });

        res.status(201).json(newAdmin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create Staff (Admin/SuperAdmin only)
router.post('/add-staff', protect, admin, async (req, res) => {
    try {
        const { name, email, password, phone, permissions } = req.body;

        const existing = await Staff.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Staff already exists' });

        const newStaff = await Staff.create({
            name, email, password, phone, permissions
        });

        res.status(201).json(newStaff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Super Admin - SuperAdmin Only
router.post('/add-superadmin', protect, superAdmin, async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const existing = await SuperAdmin.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Super Admin already exists' });
        const newSuper = await SuperAdmin.create({ name, email, password, phone });
        res.status(201).json(newSuper);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Promote Staff to Admin - SuperAdmin Only
router.put('/promote-staff/:id', protect, superAdmin, async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);
        if (!staff) return res.status(404).json({ message: 'Staff member not found' });

        const newAdmin = await Admin.create({
            name: staff.name,
            email: staff.email,
            password: staff.password,
            phone: staff.phone,
            role: 'admin'
        });

        await staff.deleteOne();
        res.json({ message: 'Promoted to Admin successfully', newAdmin });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Setup Initial Super Admin
router.post('/setup-superadmin', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Security check: only allow if no super admin exists? or just simple secret?
        // For now, let's just create one.

        const existing = await SuperAdmin.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Super Admin already exists' });
        }

        const superAdmin = await SuperAdmin.create({
            name,
            email,
            password
        });

        res.status(201).json({
            _id: superAdmin._id,
            name: superAdmin.name,
            email: superAdmin.email,
            role: 'superadmin',
            token: generateToken(superAdmin._id, 'superadmin')
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
