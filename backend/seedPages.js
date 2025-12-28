const mongoose = require('mongoose');
const Page = require('./models/Page');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('MongoDB Connected');

        const count = await Page.countDocuments();
        if (count === 0) {
            await Page.create({
                title: 'About Us',
                slug: 'about-us',
                content: '<h1>About Us</h1><p>Welcome to our store. We are dedicated to providing the best products.</p>',
                metaTitle: 'About Us - My Store',
                metaDescription: 'Learn more about our company.',
                isPublished: true
            });
            console.log('Created default "About Us" page');
        } else {
            console.log('Pages already exist');
        }

        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
