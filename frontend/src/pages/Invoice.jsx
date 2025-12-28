import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

const Invoice = () => {
    const { id } = useParams();
    const [htmlContent, setHtmlContent] = useState('');
    const [loading, setLoading] = useState(true);

    const generateInvoiceHTML = (order) => {
        const date = new Date(order.createdAt).toLocaleDateString();
        const status = order.isPaid ? 'Paid' : 'Unpaid';
        const user = order.user || { name: 'Guest', email: 'N/A' };
        const paymentId = order.paymentResult?.id || order.paymentResult?.update_time || '-';

        // Generate items rows
        const itemsRows = order.orderItems.map(item => `
            <tr class="item">
                <td>${item.name} (x${item.qty})</td>
                <td>₹${item.price}</td>
            </tr>
        `).join('');

        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Invoice</title>
    <style>
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #555;
        }
        .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
        }
        .invoice-box table td {
            padding: 5px;
            vertical-align: top;
        }
        .invoice-box table tr td:nth-child(2) {
            text-align: right;
        }
        .invoice-box table tr.top table td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #333;
        }
        .invoice-box table tr.information table td {
            padding-bottom: 40px;
        }
        .invoice-box table tr.heading td {
            background: #eee;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
        }
        .invoice-box table tr.details td {
            padding-bottom: 20px;
        }
        .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
        }
        .invoice-box table tr.item.last td {
            border-bottom: none;
        }
        .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #eee;
            font-weight: bold;
        }
        @media only screen and (max-width: 600px) {
            .invoice-box table tr.top table td {
                width: 100%;
                display: block;
                text-align: center;
            }
            .invoice-box table tr.information table td {
                width: 100%;
                display: block;
                text-align: center;
            }
        }
        /** RTL **/
        .invoice-box.rtl {
            direction: rtl;
            font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        }
        .invoice-box.rtl table {
            text-align: right;
        }
        .invoice-box.rtl table tr td:nth-child(2) {
            text-align: left;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title">
                                ShopWave
                            </td>
                            <td>
                                Invoice #: ${order._id}<br />
                                Created: ${date}<br />
                                Status: ${status}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td>
                                ${order.shippingAddress.address}<br />
                                ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br />
                                ${order.shippingAddress.country}
                            </td>
                            <td>
                                ${user.name}<br />
                                ${user.email}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="heading">
                <td>Payment Method</td>
                <td>Check #</td>
            </tr>
            <tr class="details">
                <td>${order.paymentMethod}</td>
                <td>${paymentId}</td>
            </tr>
            <tr class="heading">
                <td>Item</td>
                <td>Price</td>
            </tr>
            ${itemsRows}
            <tr class="total">
                <td></td>
                <td>Total: ₹${order.totalPrice}</td>
            </tr>
        </table>
    </div>
</body>
</html>`;
    };

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                const html = generateInvoiceHTML(data);
                setHtmlContent(html);
                setLoading(false);
            } catch (error) {
                console.error("Error generating invoice:", error);
                setHtmlContent('<h1 style="text-align:center; padding: 20px;">Error loading invoice</h1>');
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
    }, [id]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>Loading Invoice...</div>;
    }

    return (
        <div style={{ width: '100%', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
            <iframe
                srcDoc={htmlContent}
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Invoice"
            />
        </div>
    );
};

export default Invoice;
