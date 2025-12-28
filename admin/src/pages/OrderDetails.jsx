import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaPrint, FaDownload, FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaCreditCard, FaUser, FaMapMarkerAlt, FaStickyNote } from 'react-icons/fa';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState('');
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

    const updateStatus = async (status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            fetchOrder();
        } catch (error) {
            console.error("Error updating status", error);
        }
    };

    const markAsPaid = async () => {
        if (window.confirm('Are you sure you want to mark this order as PAID?')) {
            try {
                await api.put(`/orders/${id}/pay`, {
                    id: `MANUAL_${Date.now()}`,
                    status: 'COMPLETED',
                    update_time: new Date().toISOString(),
                    email_address: order.user?.email || 'admin@manual.com'
                });
                fetchOrder();
            } catch (error) {
                console.error("Error marking as paid", error);
            }
        }
    };

    const addNote = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/orders/${id}/note`, { text: note });
            setNote('');
            fetchOrder();
        } catch (error) {
            console.error("Error adding note", error);
        }
    };

    const downloadInvoice = async () => {
        try {
            const config = {
                responseType: 'blob',
            };
            const { data } = await api.get(`/orders/${id}/invoice`, config);

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Error downloading invoice", err);
            alert("Error downloading invoice");
        }
    };

    if (loading) return <div className="loading">Loading Order Details...</div>;
    if (!order) return <div className="error">Order not found</div>;

    return (
        <div className="order-details-container">
            {/* Header */}
            <div className="order-header">
                <div className="header-left">
                    <Link to="/orders" className="back-link"><FaArrowLeft /> Back to Orders</Link>
                    <h1>Order #{order._id}</h1>
                    <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="header-actions">
                    <a href={`/invoice.html?id=${order._id}`} className="btn-secondary" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', marginRight: '10px' }}>
                        <FaPrint /> Print Invoice
                    </a>
                    <button className="btn-secondary" onClick={downloadInvoice}><FaDownload /> Download PDF</button>
                </div>
            </div>

            <div className="order-grid">
                {/* Left Column */}
                <div className="order-left-col">
                    {/* Customer Info */}
                    <div className="card customer-card">
                        <h3><FaUser /> Customer Details</h3>
                        <div className="info-row">
                            <span className="label">Name:</span>
                            <span className="value">{order.user?.name || 'Guest'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Email:</span>
                            <span className="value">{order.user?.email || order.paymentResult?.email_address || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">User ID:</span>
                            <span className="value small">{order.user?._id || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="card shipping-card">
                        <h3><FaMapMarkerAlt /> Shipping Address</h3>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p><strong>Phone:</strong> {order.shippingAddress.phone || 'N/A'}</p>
                        <div className="delivery-type">
                            <span className="label">Type:</span> {order.shippingAddress.deliveryType || 'Standard'}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card payment-card">
                        <h3><FaCreditCard /> Payment Info</h3>
                        <div className="info-row">
                            <span className="label">Method:</span>
                            <span className="value">{order.paymentMethod}</span>
                        </div>
                        <div className="info-row">
                            <span className="label">Status:</span>
                            <span className={`badge ${order.isPaid ? 'success' : 'danger'}`}>
                                {order.isPaid ? 'Paid' : 'Unpaid'}
                            </span>
                            {!order.isPaid && (
                                <button className="btn-xs btn-success" onClick={markAsPaid} style={{ marginLeft: '10px' }}>
                                    Mark as Paid
                                </button>
                            )}
                        </div>
                        {order.isPaid && (
                            <div className="info-row">
                                <span className="label">Paid At:</span>
                                <span className="value">{new Date(order.paidAt).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Center Column */}
                <div className="order-center-col">
                    {/* Order Items */}
                    <div className="card items-card">
                        <h3>Order Items ({order.orderItems.length})</h3>
                        <table className="items-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Qty</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.orderItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="product-cell">
                                            <img src={item.image} alt={item.name} className="item-thumb" />
                                            <div className="item-details">
                                                <span className="item-name">{item.name}</span>
                                                {item.variant && (
                                                    <span className="item-variant">
                                                        Variant: {typeof item.variant === 'object'
                                                            ? Object.entries(item.variant).map(([key, value]) => `${key}: ${value}`).join(', ')
                                                            : item.variant}
                                                    </span>
                                                )}
                                                {item.sku && <span className="item-sku">SKU: {item.sku}</span>}
                                            </div>
                                        </td>
                                        <td>₹{item.price}</td>
                                        <td>{item.qty}</td>
                                        <td>₹{(item.price * item.qty).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="card totals-card">
                        <div className="total-row">
                            <span>Subtotal</span>
                            <span>₹{order.itemsPrice.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Tax</span>
                            <span>₹{order.taxPrice.toFixed(2)}</span>
                        </div>
                        <div className="total-row">
                            <span>Shipping</span>
                            <span>₹{order.shippingPrice.toFixed(2)}</span>
                        </div>
                        <div className="total-row grand-total">
                            <span>Total Amount</span>
                            <span>₹{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="order-right-col">
                    {/* Status Update */}
                    <div className="card status-card">
                        <h3>Order Status</h3>
                        <div className={`current-status ${order.orderStatus.toLowerCase()}`}>
                            {order.orderStatus}
                        </div>
                        <div className="status-actions">
                            <label>Update Status:</label>
                            <select
                                value={order.orderStatus}
                                onChange={(e) => updateStatus(e.target.value)}
                                className="status-select"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="card timeline-card">
                        <h3>Activity Timeline</h3>
                        <ul className="timeline">
                            {order.timeline && order.timeline.length > 0 ? (
                                order.timeline.map((event, index) => (
                                    <li key={index} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content">
                                            <span className="timeline-status">{event.status}</span>
                                            <span className="timeline-date">{new Date(event.date).toLocaleString()}</span>
                                            {event.note && <p className="timeline-note">{event.note}</p>}
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="timeline-item">
                                    <div className="timeline-dot"></div>
                                    <div className="timeline-content">
                                        <span className="timeline-status">Order Placed</span>
                                        <span className="timeline-date">{new Date(order.createdAt).toLocaleString()}</span>
                                    </div>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Internal Notes */}
                    <div className="card notes-card">
                        <h3><FaStickyNote /> Internal Notes</h3>
                        <div className="notes-list">
                            {order.notes && order.notes.map((note, index) => (
                                <div key={index} className="note-item">
                                    <p>{note.text}</p>
                                    <span className="note-date">{new Date(note.date).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={addNote} className="add-note-form">
                            <textarea
                                placeholder="Add a private note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                required
                            ></textarea>
                            <button type="submit" className="btn-primary small">Add Note</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
