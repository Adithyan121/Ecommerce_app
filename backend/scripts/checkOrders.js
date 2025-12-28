const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const orders = await Order.find({}).populate('user', 'name email');

        console.log('\n--- ALL ORDERS ---');
        orders.forEach(order => {
            console.log(`Order ID: ${order._id} | User: ${order.user ? order.user.name + ' (' + order.user.email + ')' : 'UNKNOWN'} | Total: ${order.totalPrice}`);
        });
        console.log('------------------\n');

        const users = await User.find({});
        console.log('--- USERS ---');
        users.forEach(u => {
            console.log(`User: ${u.name} | Email: ${u.email} | ID: ${u._id} | Admin: ${u.isAdmin}`);
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
