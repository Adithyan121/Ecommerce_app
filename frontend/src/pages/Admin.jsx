import React, { useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FaFileInvoice, FaFileCsv } from 'react-icons/fa';
import './Admin.css';

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.isAdmin && user.token) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        if (!user || !user.token) return;
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setLoading(false);
        }
    };

    const downloadSummary = async () => {
        if (!user || !user.token) return;
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
            toast.error("Error downloading summary");
        }
    };

    const downloadInvoice = async (orderId) => {
        if (!user || !user.token) return;
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
            toast.error("Error downloading invoice");
        }
    };

    if (!user || !user.isAdmin) {
        return <div className="container">Access Denied</div>;
    }

    return (
        <div className="container admin-page">
            <div className="admin-header">
                <h1>Admin Panel</h1>
                <button className="btn btn-primary" onClick={downloadSummary}>
                    <FaFileCsv /> Download Order Summary
                </button>
            </div>

            {loading ? <p>Loading orders...</p> : error ? <p className="error">{error}</p> : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.user?.name}</td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>₹{order.totalPrice}</td>
                                    <td>
                                        <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-sm btn-outline"
                                            onClick={() => downloadInvoice(order._id)}
                                            title="Download Invoice"
                                        >
                                            <FaFileInvoice /> Invoice
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Admin;
