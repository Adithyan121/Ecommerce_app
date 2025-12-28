import React, { useEffect, useState } from 'react';
import api from '../api';
import { useParams, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaShoppingBag, FaStar, FaStickyNote, FaBan, FaTrash, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';
import './CustomerDetails.css';

const CustomerDetails = () => {
    const { id } = useParams();
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(true);

    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name || '',
                email: customer.email || '',
                phone: customer.phone || ''
            });
        }
    }, [customer]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data: userData } = await api.get(`/users/${id}`);
            setCustomer(userData);

            // Fetch extra data only if it's a customer
            if (userData.role === 'user' || (!userData.role && !userData.isAdmin)) {
                try {
                    const { data: orderData } = await api.get(`/orders/user/${id}`);
                    setOrders(orderData);
                } catch (err) { console.error("Error fetching orders", err); }

                try {
                    const { data: reviewData } = await api.get(`/reviews/user/${id}`);
                    setReviews(reviewData);
                } catch (err) { console.error("Error fetching reviews", err); }
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching details", error);
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${id}`, formData);
            setEditMode(false);
            fetchData();
        } catch (error) {
            console.error("Error updating user", error);
            alert("Failed to update user");
        }
    };

    const toggleBlock = async () => {
        try {
            const { data } = await api.put(`/users/${id}/ban`);
            setCustomer(prev => ({ ...prev, isBlocked: data.isBlocked }));
            alert(`User ${data.isBlocked ? 'Blocked' : 'Unblocked'}`);
        } catch (error) {
            console.error("Error blocking user", error);
            alert("Failed to update status");
        }
    };

    const deleteUser = async () => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await api.delete(`/users/${id}`);
                alert('User deleted');
                // Redirect back
                window.location.href = '/customers';
            } catch (error) {
                console.error("Error deleting user", error);
                alert("Failed to delete user");
            }
        }
    };

    const addNote = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post(`/users/${id}/note`, { text: note });
            setCustomer(data);
            setNote('');
        } catch (error) {
            console.error("Error adding note", error);
            alert("Failed to add note");
        }
    };

    if (loading) return <div className="loading">Loading Details...</div>;
    // ...

    return (
        <div className="customer-details-container">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <Link to="/customers" className="back-link"><FaArrowLeft /> Back to List</Link>
                    <h1>
                        {editMode ? 'Edit User' : customer.name}
                    </h1>
                    {!editMode && <span className={`status-badge ${customer.isBlocked ? 'blocked' : 'active'}`}>
                        {customer.isBlocked ? 'Blocked' : 'Active'}
                        {customer.role && ` (${customer.role.toUpperCase()})`}
                    </span>}
                </div>
                <div className="header-actions">
                    {!editMode ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => setEditMode(true)}>
                                Edit Profile
                            </button>
                            <button className={`btn ${customer.isBlocked ? 'btn-success' : 'btn-warning'}`} onClick={toggleBlock}>
                                {customer.isBlocked ? <FaCheckCircle /> : <FaBan />} {customer.isBlocked ? 'Unblock' : 'Block'}
                            </button>
                            <button className="btn btn-danger" onClick={deleteUser}>
                                <FaTrash /> Delete
                            </button>
                        </>
                    ) : (
                        <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {editMode ? (
                <div className="card profile-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <form onSubmit={handleUpdate}>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem' }}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Save Changes</button>
                    </form>
                </div>
            ) : (
                <div className="details-grid">
                    {/* Left Column */}
                    <div className="left-col">
                        {/* Profile Info */}
                        <div className="card profile-card">
                            <h3><FaUser /> Profile Info</h3>
                            <div className="info-row">
                                <span className="label">Role:</span>
                                <span className="value" style={{ textTransform: 'capitalize' }}>{customer.role || (customer.isAdmin ? 'Admin' : 'User')}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Email:</span>
                                <span className="value">{customer.email}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">Phone:</span>
                                <span className="value">{customer.phone || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <span className="label">ID:</span>
                                <span className="value small">{customer._id}</span>
                            </div>
                        </div>

                        {/* Internal Notes - Available for all */}
                        <div className="card notes-card">
                            <h3><FaStickyNote /> Internal Notes</h3>
                            <div className="notes-list">
                                {customer.notes && customer.notes.map((note, index) => (
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

                    {/* Center Column - Only show Orders/Addresses/Reviews for Customers/Users */}
                    {(customer.role === 'user' || (!customer.role && !customer.isAdmin)) && (
                        <div className="center-col">
                            {/* Address Card */}
                            <div className="card address-card" style={{ marginBottom: '1rem' }}>
                                <h3><FaMapMarkerAlt /> Addresses</h3>
                                {customer.addresses && customer.addresses.length > 0 ? (
                                    customer.addresses.map((addr, index) => (
                                        <div key={index} className="address-item">
                                            {addr.isDefault && <span className="badge default">Default</span>}
                                            <p>{addr.street}</p>
                                            <p>{addr.city}, {addr.state} {addr.zip}</p>
                                            <p>{addr.country}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data">No saved addresses</p>
                                )}
                            </div>

                            {/* Order History */}
                            <div className="card orders-card">
                                <h3><FaShoppingBag /> Order History</h3>
                                {orders.length > 0 ? (
                                    <table className="simple-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.map(order => (
                                                <tr key={order._id}>
                                                    <td>#{order._id.substring(0, 8)}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <span className={`badge ${order.orderStatus.toLowerCase()}`}>
                                                            {order.orderStatus}
                                                        </span>
                                                    </td>
                                                    <td>₹{order.totalPrice.toFixed(2)}</td>
                                                    <td>
                                                        <Link to={`/orders/${order._id}`} className="btn-link">View</Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p className="no-data">No orders placed yet.</p>
                                )}
                            </div>

                            {/* Reviews */}
                            <div className="card reviews-card">
                                <h3><FaStar /> Reviews</h3>
                                {reviews.length > 0 ? (
                                    <div className="reviews-list">
                                        {reviews.map(review => (
                                            <div key={review._id} className="review-item">
                                                <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span className="product-name" style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{review.product?.name}</span>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} size={12} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="review-text" style={{ fontSize: '0.9rem', margin: '0.5rem 0' }}>"{review.comment}"</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-data">No reviews.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerDetails;
