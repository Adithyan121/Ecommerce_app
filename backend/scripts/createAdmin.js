const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'admin@example.com';
        const password = 'password123';

        // Check if exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            await User.deleteOne({ email });
            console.log('Existing admin removed.');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name: 'Super Admin',
            email,
            password: hashedPassword,
            isAdmin: true,
            isBlocked: false
        });

        console.log(`Admin created: ${user.email} / ${password}`);
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createAdmin();
