// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const Notification = require('./models/Notification');

// dotenv.config();

// mongoose.connect(process.env.MONGO_URI)
//     .then(async () => {
//         console.log('MongoDB Connected');
//         try {
//             const notification = await Notification.create({
//                 type: 'test',
//                 message: 'Test Notification from Script',
//                 link: '/test'
//             });
//             console.log('Notification Created:', notification);
//         } catch (error) {
//             console.error('Error creating notification:', error);
//         } finally {
//             mongoose.disconnect();
//         }
//     })
//     .catch(err => console.log(err));
