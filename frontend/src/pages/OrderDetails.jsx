import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { FaArrowLeft, FaBox, FaMapMarkerAlt, FaCreditCard, FaPrint, FaDownload } from 'react-icons/fa';
import './OrderDetails.css';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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

        if (user) {
            fetchOrder();
        }
    }, [id, user]);

    const downloadInvoice = async () => {
        try {
            const config = { responseType: 'blob' };
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
        }
    };

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;
    if (!order) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Order not found</div>;

    return (
        <div className="container order-details-page">
            <Link to="/profile" className="btn-back"><FaArrowLeft /> Back to Orders</Link>

            <div className="order-header-main">
                <div>
                    <h1>Order #{order._id.substring(0, 8)}</h1>
                    <p>Placed on {new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="status-badge-lg" data-status={order.orderStatus}>
                    {order.orderStatus}
                </div>
            </div>

            <div className="order-grid-layout">
                <div className="order-main-col">
                    <div className="card items-card">
                        <h3>Order Items</h3>
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="order-item-row">
                                <img src={item.image} alt={item.name} />
                                <div className="item-info">
                                    <Link to={`/product/${item.product}`} className="item-name">{item.name}</Link>
                                    <p className="item-meta">Qty: {item.qty} | Price: ₹{item.price}</p>
                                    {item.variant && (
                                        <p className="item-variant">
                                            Variant: {typeof item.variant === 'object'
                                                ? Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')
                                                : item.variant}
                                        </p>
                                    )}
                                </div>
                                <div className="item-total">
                                    ₹{(item.qty * item.price).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="card totals-card">
                        <div className="total-row"><span>Subtotal</span><span>₹{order.itemsPrice.toFixed(2)}</span></div>
                        <div className="total-row"><span>Tax</span><span>₹{order.taxPrice.toFixed(2)}</span></div>
                        <div className="total-row"><span>Shipping</span><span>₹{order.shippingPrice.toFixed(2)}</span></div>
                        <div className="total-row grand-total"><span>Total</span><span>₹{order.totalPrice.toFixed(2)}</span></div>
                    </div>
                </div>

                <div className="order-sidebar-col">
                    <div className="card sidebar-card">
                        <h3><FaMapMarkerAlt /> Shipping Address</h3>
                        <p>{order.shippingAddress.address}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                        <p>{order.shippingAddress.country}</p>
                        <p>Phone: {order.shippingAddress.phone}</p>
                    </div>

                    <div className="card sidebar-card">
                        <h3><FaCreditCard /> Payment Info</h3>
                        <p>Method: {order.paymentMethod}</p>
                        <p>Status: <span className={order.isPaid ? 'text-success' : 'text-danger'}>{order.isPaid ? 'Paid' : 'Pending'}</span></p>
                    </div>

                    <div className="card sidebar-card actions-card">
                        <button className="btn btn-block" onClick={downloadInvoice}><FaDownload /> Download Invoice</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
