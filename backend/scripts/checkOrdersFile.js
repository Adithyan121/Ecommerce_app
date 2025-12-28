const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        let output = 'MongoDB Connected\n';

        const orders = await Order.find({}).populate('user', 'name email');

        output += '\n--- ALL ORDERS ---\n';
        orders.forEach(order => {
            output += `Order ID: ${order._id} | User: ${order.user ? order.user.name + ' (' + order.user.email + ')' : 'UNKNOWN'} | Total: ${order.totalPrice}\n`;
        });
        output += '------------------\n';

        const users = await User.find({});
        output += '\n--- USERS ---\n';
        users.forEach(u => {
            output += `User: ${u.name} | Email: ${u.email} | ID: ${u._id} | Admin: ${u.isAdmin}\n`;
        });

        fs.writeFileSync('order_debug.txt', output);
        console.log('Debug info written to order_debug.txt');

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkOrders();
