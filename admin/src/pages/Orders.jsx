import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaEye, FaFileCsv, FaFileInvoice } from 'react-icons/fa';
import './Products.css';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    useEffect(() => {
        if (userInfo && userInfo.token) {
            fetchOrders();
        }
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders", error);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrders();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const downloadSummary = async () => {
        try {
            const config = {
                responseType: 'blob',
            };
            const { data } = await api.get('/orders/summary', config);

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'orders_summary.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading summary", err);
            alert("Error downloading summary");
        }
    };

    const downloadInvoice = async (orderId) => {
        try {
            const config = {
                responseType: 'blob',
            };
            const { data } = await api.get(`/orders/${orderId}/invoice`, config);

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading invoice", err);
            alert("Error downloading invoice");
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Orders</h1>
                <button className="btn-download" onClick={downloadSummary}>
                    <FaFileCsv /> Download Summary
                </button>
            </div>
            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>#{order._id.substring(0, 8)}</td>
                                <td>{order.user ? order.user.name : 'Guest'}</td>
                                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td>₹{order.totalPrice.toFixed(2)}</td>
                                <td>
                                    <select
                                        value={order.orderStatus}
                                        onChange={(e) => updateStatus(order._id, e.target.value)}
                                        className={`status-badge ${order.orderStatus.toLowerCase()}`}
                                        style={{ border: 'none', cursor: 'pointer', padding: '5px', borderRadius: '5px' }}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Link to={`/orders/${order._id}`} className="btn-icon" title="View Details">
                                            <FaEye />
                                        </Link>
                                        <button
                                            className="btn-icon"
                                            onClick={() => downloadInvoice(order._id)}
                                            title="Download Invoice"
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4f46e5', fontSize: '1rem' }}
                                        >
                                            <FaFileInvoice />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;
