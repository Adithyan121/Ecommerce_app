const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');
const logActivity = require('../utils/activityLogger');
const notifyAdmin = require('../utils/notificationSender');
const generateInvoice = require('../utils/invoiceGenerator');
const path = require('path');
const fs = require('fs');
const { Parser } = require('json2csv');

// Get all orders (Admin)
router.get('/', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get logged in user orders
router.get('/mine', protect, async (req, res) => {
    try {
        console.log('--- /mine Request ---');
        console.log('User from Token:', req.user.name, req.user.email, req.user._id);


        const userId = new mongoose.Types.ObjectId(req.user._id);

        const query = { user: userId };
        console.log('Mongo Query:', JSON.stringify(query));

        const orders = await Order.find(query).populate('user', 'name email');
        console.log(`Query Result: Found ${orders.length} orders.`);

        if (orders.length > 0) {
            console.log('First Order User:', orders[0].user ? orders[0].user.email : 'No User Populated');
        }
        console.log('-------------------------');

        res.json(orders);
    } catch (error) {
        console.error('Error in /mine:', error);
        res.status(500).json({ message: error.message });
    }

});

// Get orders by User ID (Admin)
router.get('/user/:id', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Download Order Summary (CSV)
router.get('/summary', protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email');

        const fields = [
            { label: 'Order ID', value: '_id' },
            { label: 'User Name', value: 'user.name' },
            { label: 'User Email', value: 'user.email' },
            { label: 'Date', value: (row) => new Date(row.createdAt).toLocaleDateString() },
            { label: 'Total Price', value: 'totalPrice' },
            { label: 'Status', value: 'orderStatus' },
            { label: 'Payment Method', value: 'paymentMethod' },
            { label: 'Is Paid', value: (row) => row.isPaid ? 'Yes' : 'No' },
            { label: 'Is Delivered', value: (row) => row.isDelivered ? 'Yes' : 'No' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(orders);

        res.header('Content-Type', 'text/csv');
        res.attachment('orders_summary.csv');
        return res.send(csv);

    } catch (error) {
        console.error("Error generating summary:", error);
        res.status(500).json({ message: error.message });
    }
});

// Download Invoice (PDF)
router.get('/:id/invoice', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Check if user is authorized (admin or the user who placed the order)
        const isOwner = req.user._id.toString() === order.user._id.toString();
        const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin' || req.user.isAdmin === true;

        if (!isOwner && !isAdmin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const invoiceDir = path.join(__dirname, '../invoices');
        if (!fs.existsSync(invoiceDir)) {
            fs.mkdirSync(invoiceDir);
        }
        const invoicePath = path.join(invoiceDir, `invoice-${order._id}.pdf`);

        // Always generate on the fly to ensure latest template/data is used
        await generateInvoice(order, invoicePath);
        res.download(invoicePath);

    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ message: error.message });
    }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new order
router.post('/', protect, async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body;

    const Product = require('../models/Product');
    const User = require('../models/User'); // Import User for staff assignment

    console.log("Received Order Request Body:", JSON.stringify(req.body, null, 2)); // Debug log
    console.log("User creating order:", req.user ? req.user._id : "No User"); // Debug log

    try {
        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        } else {
            // Randomly Assign to Staff
            // Find all users with role 'staff' who are not blocked
            const staffMembers = await User.find({ role: 'staff', isBlocked: false });
            let assignedStaffId = null;

            if (staffMembers.length > 0) {
                const randomIndex = Math.floor(Math.random() * staffMembers.length);
                assignedStaffId = staffMembers[randomIndex]._id;
            }

            const order = new Order({
                orderItems,
                user: req.user._id,
                assignedTo: assignedStaffId, // Save assignment
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                timeline: [
                    {
                        status: 'Order Placed',
                        note: 'Order placed successfully'
                    }
                ]
            });

            // Decrease Stock
            const SKU = require('../models/SKU');
            const Inventory = require('../models/Inventory');

            // Decrease Stock & Reserve
            for (const item of orderItems) {
                const product = await Product.findById(item.product);
                if (product) {
                    product.stock = product.stock - item.qty;
                    await product.save();

                    // Warehouse Reservation
                    try {
                        let sku = await SKU.findOne({ productId: product._id });
                        // If no SKU exists, we might want to create a temporary one? 
                        // For now, only reserve if SKU exists.
                        if (sku) {
                            // Find warehouse with most stock
                            const inventory = await Inventory.findOne({ skuId: sku._id }).sort({ quantity: -1 });
                            if (inventory) {
                                inventory.reserved += item.qty;
                                await inventory.save();
                            }
                        }
                    } catch (rErr) {
                        console.error("Stock Reservation Failed:", rErr);
                    }
                }
            }

            const createdOrder = await order.save();

            // Notify Admin
            await notifyAdmin('order', `New Order #${createdOrder._id} placed by ${req.user.name}`, `/orders/${createdOrder._id}`);

            // Notify Warehouse Staff Listeners (Broadcast)
            if (req.io) {
                req.io.to('staff_room').emit('new_order', {
                    _id: createdOrder._id,
                    totalPrice: createdOrder.totalPrice,
                    itemsCount: createdOrder.orderItems.length,
                    createdAt: createdOrder.createdAt
                });

                // Notify Assigned Staff Specifically
                if (assignedStaffId) {
                    console.log(`Assigning Order ${createdOrder._id} to Staff ${assignedStaffId}`);
                    req.io.to(assignedStaffId.toString()).emit('new_assigned_order', {
                        _id: createdOrder._id,
                        totalPrice: createdOrder.totalPrice,
                        itemsCount: createdOrder.orderItems.length,
                        createdAt: createdOrder.createdAt
                    });
                }
            }

            // Generate Invoice
            try {
                const invoiceDir = path.join(__dirname, '../invoices');
                if (!fs.existsSync(invoiceDir)) {
                    fs.mkdirSync(invoiceDir);
                }
                const invoicePath = path.join(invoiceDir, `invoice-${createdOrder._id}.pdf`);

                // We need to populate user for the invoice template
                const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');
                await generateInvoice(populatedOrder, invoicePath);
                console.log(`Invoice generated for order ${createdOrder._id}`);
            } catch (invError) {
                console.error("Failed to generate invoice on order creation:", invError);
                // Don't fail the request if invoice generation fails, just log it
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: error.message });
    }
});

// Update order status (Admin)
router.put('/:id/status', protect, admin, async (req, res) => {
    const { status, trackingNumber, courier } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = status || order.orderStatus;

            // Update Timeline
            order.timeline.push({
                status: status,
                note: `Status updated to ${status}`
            });

            if (status === 'Shipped') {
                order.shippedAt = Date.now();
                order.trackingNumber = trackingNumber;
                order.courier = courier;
            }
            if (status === 'Delivered') {
                order.isDelivered = true;
                order.deliveredAt = Date.now();

                // COD Payment Logic: Mark as paid upon delivery
                if (order.paymentMethod === 'COD' && !order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = Date.now();
                    order.timeline.push({
                        status: 'Paid',
                        note: 'Payment received upon delivery (COD)'
                    });
                }
            }

            const updatedOrder = await order.save();
            await logActivity(req.user._id, 'Updated Order Status', `Order ID: ${order._id}`, { status }, req);
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update order to paid
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentResult = {
                id: req.body.id,
                status: req.body.status,
                update_time: req.body.update_time,
                email_address: req.body.email_address,
            };

            order.timeline.push({
                status: 'Paid',
                note: 'Payment received successfully'
            });

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add Internal Note (Admin)
router.post('/:id/note', protect, admin, async (req, res) => {
    const { text } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.notes.push({
                text,
                isAdmin: true
            });
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
