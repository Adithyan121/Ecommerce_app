const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const compression = require('compression');

// Import Models for Socket Logic
const Message = require('./models/Message');
const Notification = require('./models/Notification');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for development
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io Middleware to make io accessible in controllers
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Import
const analyticsRoutes = require('./routes/analyticsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cmsRoutes = require('./routes/cmsRoutes');
const couponRoutes = require('./routes/couponRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const shippingRoutes = require('./routes/shippingRoutes');
const userRoutes = require('./routes/userRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const chatRoutes = require('./routes/chatRoutes');

// Routes Mount
app.use('/api/analytics', analyticsRoutes);
app.use('/api/banners', require('./routes/bannerRoutes'));
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/warehouse', require('./routes/warehouseRoutes'));
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket.io Connection & Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User joins their own room (roomId = userId)
    socket.on('join_room', (userId) => {
        if (!userId) return;
        socket.join(userId);
        console.log(`User ${userId} joined room: ${userId}`);
    });

    // Admin/Support joins the support room
    socket.on('join_support', () => {
        socket.join('support_room');
        console.log(`Admin joined support room`);
    });

    // Warehouse Staff joins staff room
    socket.on('join_staff', () => {
        socket.join('staff_room');
        console.log('User joined staff_room');
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
        const { senderId, receiverId, text, isAdmin } = data;

        try {
            // Save to Database
            const messageData = {
                sender: senderId,
                text,
                isAdmin: isAdmin
            };
            if (receiverId) {
                messageData.receiver = receiverId;
            }

            const newMessage = await Message.create(messageData);

            // Populate if needed, or just send raw data
            // const populatedMessage = await newMessage.populate('sender', 'name'); 

            // Logic to emit to correct rooms
            if (isAdmin && receiverId) {
                // Admin answering a specific user
                // Emit to that user's room
                io.to(receiverId).emit('receive_message', newMessage);
                // Also emit to support room so other admins see it (optional)
                io.to('support_room').emit('receive_message', newMessage);
            }
            else if (!isAdmin) {
                // User sending to support
                // Emit to support room
                io.to('support_room').emit('receive_message', newMessage);

                // Also emit to the user's specific room so they see their own message coming back? 
                // Or frontend handles it? Usually frontend appends optimistically. 
                // But let's confirm receipt.
                // If the user is in their own room 'senderId', we can emit there too.
                // io.to(senderId).emit('receive_message', newMessage); 
                // NOTE: If frontend adds optimistic, this causes duplicate. 
                // Check frontend logic: ChatWidget.jsx adds optimistic AND listens to receive_message.
                // It appends if incoming.

                // Let's create a notification for Admins
                const notif = await Notification.create({
                    type: 'info',
                    message: `New message from user`, // You might want user name here but we only have ID in socket data usually. 
                    link: `/support?user=${senderId}`,
                    isRead: false
                });

                // Emit notification to support room
                io.to('support_room').emit('receive_notification', notif);
            }

        } catch (err) {
            console.error('Error handling socket message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
