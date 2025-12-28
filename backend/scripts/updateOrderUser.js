const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const updateOrderUser = async (orderId, userEmail) => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.log(`User with email ${userEmail} not found`);
            process.exit(1);
        }

        const order = await Order.findById(orderId);
        if (!order) {
            console.log(`Order with ID ${orderId} not found`);
            process.exit(1);
        }

        console.log(`Updating Order ${orderId}`);
        console.log(`Current User: ${order.user}`);
        console.log(`New User: ${user._id} (${user.name})`);

        order.user = user._id;
        await order.save();

        console.log('Order updated successfully');
        process.exit();
    } catch (error) {
        console.error('Error updating order:', error);
        process.exit(1);
    }
};

// Usage: node updateOrderUser.js <orderId> <userEmail>
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: node updateOrderUser.js <orderId> <userEmail>');
    process.exit(1);
}

updateOrderUser(args[0], args[1]);
