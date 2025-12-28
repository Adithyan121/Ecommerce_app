import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import './Invoice.css';

const Invoice = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (userInfo && userInfo.token) {
            fetchOrder();
        }
    }, [id]);

    const fetchOrder = async () => {
        try {
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching order", error);
            setLoading(false);
        }
    };

    if (loading) return <div className="invoice-loading">Loading Invoice...</div>;
    if (!order) return <div className="invoice-error">Order not found</div>;

    return (
        <div className="invoice-container">
            <div className="invoice-header">
                <div className="company-details">
                    <h1>INVOICE</h1>
                    <h2>My E-Commerce Store</h2>
                    <p>123 Commerce St, Business City, 12345</p>
                    <p>Email: support@myecommercestore.com</p>
                    <p>Phone: (555) 123-4567</p>
                </div>
                <div className="invoice-meta">
                    <div className="meta-row">
                        <span className="label">Invoice #:</span>
                        <span className="value">{order._id}</span>
                    </div>
                    <div className="meta-row">
                        <span className="label">Date:</span>
                        <span className="value">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-row">
                        <span className="label">Status:</span>
                        <span className="value">{order.isPaid ? 'PAID' : 'UNPAID'}</span>
                    </div>
                </div>
            </div>

            <div className="invoice-body">
                <div className="bill-to">
                    <h3>Bill To:</h3>
                    <p><strong>{order.user?.name || 'Guest'}</strong></p>
                    <p>{order.shippingAddress.address}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                    <p>{order.user?.email || order.paymentResult?.email_address}</p>
                </div>

                <table className="invoice-table">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td>
                                    <div className="item-desc">
                                        <span className="item-name">{item.name}</span>
                                        {item.variant && (
                                            <span className="item-variant">
                                                ({typeof item.variant === 'object'
                                                    ? Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')
                                                    : item.variant})
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td>{item.qty}</td>
                                <td>₹{item.price.toFixed(2)}</td>
                                <td>₹{(item.price * item.qty).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="invoice-summary">
                    <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{order.itemsPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Tax:</span>
                        <span>₹{order.taxPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span>Shipping:</span>
                        <span>₹{order.shippingPrice.toFixed(2)}</span>
                    </div>
                    <div className="summary-row grand-total">
                        <span>Total:</span>
                        <span>₹{order.totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="invoice-footer">
                <p>Thank you for your business!</p>
                <button className="print-btn" onClick={() => window.print()}>Print Invoice</button>
            </div>
        </div>
    );
};

export default Invoice;
