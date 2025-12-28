const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const generateInvoice = async (order, outputPath) => {
    try {
        // Register Helper ensuring it exists before compile
        handlebars.registerHelper('multiply', (a, b) => {
            return (a * b).toFixed(2);
        });

        const templateHtml = fs.readFileSync(path.join(__dirname, '../templates/invoice.html'), 'utf8');
        const template = handlebars.compile(templateHtml);

        // Prepare data safely
        const data = {
            orderId: order._id,
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.isPaid ? 'Paid' : 'Unpaid',
            shippingAddress: order.shippingAddress.toObject ? order.shippingAddress.toObject() : order.shippingAddress,
            user: order.user && order.user.toObject ? order.user.toObject() : (order.user || { name: 'Guest', email: 'N/A' }),
            paymentMethod: order.paymentMethod,
            paymentId: order.paymentResult ? (order.paymentResult.id || 'N/A') : 'N/A',
            orderItems: order.orderItems.map(item => item.toObject ? item.toObject() : item),
            itemsPrice: order.itemsPrice ? order.itemsPrice.toFixed(2) : "0.00",
            taxPrice: order.taxPrice ? order.taxPrice.toFixed(2) : "0.00",
            shippingPrice: order.shippingPrice ? order.shippingPrice.toFixed(2) : "0.00",
            totalPrice: order.totalPrice ? order.totalPrice.toFixed(2) : "0.00"
        };

        const finalHtml = template(data);

        // Launch puppeteer with valid args for common environments
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
        await page.pdf({ path: outputPath, format: 'A4', printBackground: true });

        await browser.close();
        return outputPath;
    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        throw error;
    }
};

module.exports = generateInvoice;
