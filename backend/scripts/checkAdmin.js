const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'techtoday038@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.name}`);
            console.log(`Email: ${user.email}`);
            console.log(`Is Admin: ${user.isAdmin}`);
            console.log(`Is Blocked: ${user.isBlocked}`);

            // Force update to admin if not
            if (!user.isAdmin) {
                console.log('User is not admin. Updating to admin...');
                user.isAdmin = true;
                await user.save();
                console.log('User updated to Admin.');
            }
        } else {
            console.log('User not found.');
        }

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
