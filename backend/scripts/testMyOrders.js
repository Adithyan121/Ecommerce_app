const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '../.env') });

const testMyOrders = async () => {
    try {
        // 1. Connect and Reset Password
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const email = 'techtoday038@gmail.com';
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash('123456', salt);
        await user.save();
        console.log(`Password for ${email} reset to 123456`);

        // 2. Login
        console.log('Attempting Login...');
        const loginRes = await axios.post('http://localhost:5000/api/users/login', {
            email: email,
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('Login Successful. Token received.');
        console.log('User ID from Login:', loginRes.data._id);

        // 3. Fetch My Orders
        console.log('Fetching /api/orders/mine...');
        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };
        const ordersRes = await axios.get('http://localhost:5000/api/orders/mine', config);

        console.log(`Response Status: ${ordersRes.status}`);
        console.log(`Number of Orders: ${ordersRes.data.length}`);
        console.log('Orders:', JSON.stringify(ordersRes.data, null, 2));

        process.exit();
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
};

testMyOrders();
