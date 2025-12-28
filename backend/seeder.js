const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const users = require('./data/users');
const products = require('./data/products');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const InventoryLog = require('./models/InventoryLog');
const SKU = require('./models/SKU');
const Warehouse = require('./models/Warehouse');
const WarehouseLocation = require('./models/WarehouseLocation');
const Inventory = require('./models/Inventory');
const StockMovement = require('./models/StockMovement');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
        process.exit(1);
    });

const importData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        await InventoryLog.deleteMany();

        await SKU.deleteMany();
        await Warehouse.deleteMany();
        await Inventory.deleteMany();
        await StockMovement.deleteMany();

        // Hash passwords
        const usersWithHashedPasswords = await Promise.all(users.map(async (user) => {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);
            return { ...user, password: hashedPassword };
        }));

        const createdUsers = await User.insertMany(usersWithHashedPasswords);
        const adminUser = createdUsers[0]._id;

        const sampleProducts = products.map(product => {
            return { ...product, user: adminUser };
        });

        const createdProducts = await Product.insertMany(sampleProducts);

        // --- Warehouse Logic Start ---
        // 1. Create Main Warehouse
        const mainWarehouse = await Warehouse.create({
            name: 'Main Distribution Center',
            code: 'MDC-001',
            address: '123 Warehouse Blvd, Logistics City',
            isActive: true
        });

        // 2. Create SKUs and Inventory for each product
        for (const product of createdProducts) {
            if (product.barcode || product.sku) {
                // Create SKU
                let skuCode = product.sku || `SKU-${product._id.toString().substring(18)}`;
                let barcode = product.barcode || `BC-${product._id.toString().substring(18)}`;

                const sku = await SKU.create({
                    sku: skuCode,
                    barcode: barcode,
                    productId: product._id,
                    attributes: {
                        Category: product.category,
                        Brand: product.brand
                    }
                });

                // Create Inventory record if stock > 0
                if (product.stock > 0 || product.countInStock > 0) {
                    const qty = product.stock || product.countInStock;

                    await Inventory.create({
                        skuId: sku._id,
                        warehouseId: mainWarehouse._id,
                        quantity: qty,
                        reserved: 0
                    });

                    // Initial Stock Movement (Opening Balance)
                    await StockMovement.create({
                        skuId: sku._id,
                        warehouseId: mainWarehouse._id,
                        type: 'IN',
                        quantity: qty,
                        reason: 'Opening Balance',
                        scannedBy: adminUser,
                        createdAt: new Date()
                    });
                }
            }
        }
        // --- Warehouse Logic End ---

        // Create Sample Reviews
        const reviews = [];
        for (const product of createdProducts) {
            // Add 1-3 reviews per product
            const numReviews = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numReviews; i++) {
                const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
                reviews.push({
                    name: randomUser.name,
                    rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
                    comment: 'Great product! Highly recommended.',
                    user: randomUser._id,
                    product: product._id,
                });
            }
        }
        await Review.insertMany(reviews);

        // Create Sample Inventory Logs (Old System)
        const inventoryLogs = [];
        const changeTypes = ['restock', 'sale', 'adjustment', 'return'];

        for (let i = 0; i < 15; i++) {
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)];
            const quantityChange = Math.floor(Math.random() * 20) - 10; // Random change between -10 and 10

            inventoryLogs.push({
                product: randomProduct._id,
                user: adminUser,
                changeType: changeType,
                quantityChange: quantityChange,
                previousStock: randomProduct.stock,
                newStock: randomProduct.stock + quantityChange,
                reason: 'Sample inventory log'
            });
        }
        await InventoryLog.insertMany(inventoryLogs);

        // --- Purchase Orders Seeder ---
        const PurchaseOrder = require('./models/PurchaseOrder');
        await PurchaseOrder.deleteMany();

        // Create 2 POs
        // 1. Pending PO
        const sku1 = await SKU.findOne().sort({ createdAt: 1 });
        const sku2 = await SKU.findOne().sort({ createdAt: -1 });

        if (sku1 && sku2) {
            await PurchaseOrder.create({
                poNumber: 'PO-2023-001',
                supplier: 'Global Tech Suppliers',
                warehouseId: mainWarehouse._id,
                status: 'Created',
                items: [
                    { skuId: sku1._id, quantityExpected: 50, quantityReceived: 0 },
                    { skuId: sku2._id, quantityExpected: 200, quantityReceived: 0 }
                ],
                expectedArrivalDate: new Date(Date.now() + 86400000), // tomorrow
                createdBy: adminUser
            });

            // 2. Partially Received PO
            await PurchaseOrder.create({
                poNumber: 'PO-2023-002',
                supplier: 'Local Parts co.',
                warehouseId: mainWarehouse._id,
                status: 'Partially Received',
                items: [
                    { skuId: sku1._id, quantityExpected: 100, quantityReceived: 50 }
                ],
                expectedArrivalDate: new Date(),
                createdBy: adminUser
            });
        }
        // --- End PO Seeder ---

        // Create Sample Orders
        const orders = [];
        const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

        for (let i = 0; i < 20; i++) {
            const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];

            orders.push({
                user: randomUser._id,
                orderItems: [
                    {
                        name: randomProduct.name,
                        qty: 1,
                        image: randomProduct.image,
                        price: randomProduct.price,
                        product: randomProduct._id,
                    }
                ],
                shippingAddress: {
                    address: '123 Main St',
                    city: 'New York',
                    postalCode: '10001',
                    country: 'USA',
                    phone: '1234567890'
                },
                paymentMethod: 'PayPal',
                paymentResult: {
                    id: 'sample_payment_id',
                    status: 'completed',
                    update_time: Date.now(),
                    email_address: randomUser.email,
                },
                itemsPrice: randomProduct.price,
                taxPrice: randomProduct.price * 0.1,
                shippingPrice: 10,
                totalPrice: randomProduct.price * 1.1 + 10,
                isPaid: true,
                paidAt: Date.now(),
                orderStatus: status,
                isDelivered: status === 'Delivered',
                deliveredAt: status === 'Delivered' ? Date.now() : null,
            });
        }

        await Order.insertMany(orders);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Product.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        await InventoryLog.deleteMany();

        await SKU.deleteMany();
        await Warehouse.deleteMany();
        await Inventory.deleteMany();
        await StockMovement.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
