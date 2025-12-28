import React, { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import { CartContext } from '../context/CartContext';
import {
    FaUser, FaMapMarkerAlt, FaBoxOpen, FaHeart, FaCreditCard,
    FaGift, FaUndo, FaEnvelope, FaShieldAlt, FaHeadset, FaSignOutAlt, FaArrowLeft
} from 'react-icons/fa';
import './Profile.css';

const Profile = () => {
    const { user, logout } = useContext(AuthContext);
    const { wishlist, removeFromWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const [activeTab, setActiveTab] = useState('profile');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState(null); // For tracking modal

    // Mobile View State: 'list' or 'content'
    const [mobileView, setMobileView] = useState('list');

    // Mock Data for UI demonstration
    const [addresses, setAddresses] = useState([
        { id: 1, type: 'Home', address: '123 Main St, Apt 4B', city: 'Mumbai', state: 'MH', zip: '400001', isDefault: true },
        { id: 2, type: 'Work', address: 'Tech Park, Sector 5', city: 'Pune', state: 'MH', zip: '411057', isDefault: false }
    ]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState({ type: 'Home', address: '', city: '', state: '', zip: '', isDefault: false });

    // Handle Tab Change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setMobileView('content'); // Switch to content view on mobile
        window.scrollTo(0, 0);
    };

    const handleBackToMenu = () => {
        setMobileView('list');
    };

    // Address Handlers
    const handleAddAddress = () => {
        setEditingAddress(null);
        setAddressForm({ type: 'Home', address: '', city: '', state: '', zip: '', isDefault: false });
        setShowAddressModal(true);
    };

    const handleEditAddress = (addr) => {
        setEditingAddress(addr);
        setAddressForm(addr);
        setShowAddressModal(true);
    };

    const handleDeleteAddress = (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setAddresses(addresses.filter(a => a.id !== id));
            toast.success('Address deleted');
        }
    };

    const handleSaveAddress = (e) => {
        e.preventDefault();
        const newAddress = { ...addressForm };

        if (newAddress.isDefault) {
            // Unset other defaults
            addresses.forEach(a => a.isDefault = false);
        }

        if (editingAddress) {
            setAddresses(addresses.map(a => a.id === editingAddress.id ? newAddress : a));
            toast.success('Address updated');
        } else {
            newAddress.id = Date.now();
            setAddresses([...addresses, newAddress]);
            toast.success('Address added');
        }
        setShowAddressModal(false);
    };

    useEffect(() => {
        if (activeTab === 'orders' && user && user.token) {
            fetchOrders();
        }
    }, [activeTab, user]);

    const fetchOrders = async () => {
        if (!user || !user.token) return;
        setLoading(true);
        try {
            const { data } = await api.get('/orders/mine');
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders", error);
        } finally {
            setLoading(false);
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

    const handleTrackOrder = (order) => {
        setTrackingOrder(order);
    };

    const closeTrackingModal = () => {
        setTrackingOrder(null);
    };

    const renderContent = () => {
        return (
            <div className="content-wrapper">
                {/* Mobile Back Button */}
                <div className="mobile-back-header" onClick={handleBackToMenu}>
                    <FaArrowLeft /> Back to Menu
                </div>

                {(() => {
                    switch (activeTab) {

                        case 'profile':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Basic Account Information</h2>
                                        <button className="btn">Edit Profile</button>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name</label>
                                            <input type="text" defaultValue={user?.name} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Email Address</label>
                                            <input type="email" defaultValue={user?.email} readOnly />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone Number</label>
                                            <input type="tel" placeholder="+91 98765 43210" />
                                        </div>
                                        <div className="form-group">
                                            <label>Profile Picture</label>
                                            <input type="file" />
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        <h3>Account Status</h3>
                                        <div className="status-badge delivered" style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                                            Verified Account
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'addresses':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>My Addresses</h2>
                                        <button className="btn" onClick={handleAddAddress}>Add New Address</button>
                                    </div>
                                    <div className="address-grid">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className={`address-card ${addr.isDefault ? 'default' : ''}`}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                                    <strong>{addr.type}</strong>
                                                    {addr.isDefault && <span style={{ color: 'var(--primary-color)', fontSize: '0.8rem' }}>Default</span>}
                                                </div>
                                                <p>{addr.address}</p>
                                                <p>{addr.city}, {addr.state} - {addr.zip}</p>
                                                <div className="address-actions">
                                                    <button className="btn-sm" onClick={() => handleEditAddress(addr)}>Edit</button>
                                                    <button className="btn-sm btn-danger" onClick={() => handleDeleteAddress(addr.id)}>Delete</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        case 'orders':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>My Orders</h2>
                                        <div className="order-tabs">
                                            <div className="order-tab active">All Orders</div>
                                            <div className="order-tab">Open Orders</div>
                                            <div className="order-tab">Cancelled</div>
                                        </div>
                                    </div>
                                    {loading ? <p>Loading orders...</p> : (
                                        <div className="orders-list">
                                            {orders.length === 0 ? <p>No orders found.</p> : orders.map(order => (
                                                <div key={order._id} className="order-item">
                                                    <div className="order-header">
                                                        <div>
                                                            <strong>Order #{order._id.substring(0, 8)}</strong>
                                                            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div style={{ textAlign: 'right' }}>
                                                            <span className={`order-status ${order.orderStatus?.toLowerCase()}`}>
                                                                {order.orderStatus || 'Processing'}
                                                            </span>
                                                            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>₹{order.totalPrice}</p>
                                                        </div>
                                                    </div>
                                                    <div className="order-items">
                                                        {order.orderItems.map((item, idx) => (
                                                            <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                                                <div style={{ width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #eee' }}>
                                                                    <img
                                                                        src={item.image || (item.product && item.product.image) || 'https://via.placeholder.com/50'}
                                                                        alt={item.name}
                                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p style={{ margin: 0 }}>{item.name}</p>
                                                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>Qty: {item.qty}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                                                        <button className="btn-sm" onClick={() => handleTrackOrder(order)}>Track Order</button>
                                                        <a href={`/order/${order._id}`} className="btn-sm btn-outline">View Details</a>
                                                        <button className="btn-sm btn-outline" onClick={() => downloadInvoice(order._id)}>Download Invoice</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        case 'wishlist':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>My Wishlist</h2>
                                    </div>
                                    {wishlist.length === 0 ? (
                                        <p>You haven't saved any items yet.</p>
                                    ) : (
                                        <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                            {wishlist.map(item => (
                                                <div key={item._id} className="card" style={{ padding: '1rem', position: 'relative' }}>
                                                    <img
                                                        src={item.images?.[0] || item.image}
                                                        alt={item.name}
                                                        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                                                    />
                                                    <h4 style={{ margin: '0 0 0.5rem' }}>{item.name}</h4>
                                                    <p style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>
                                                        ₹{item.salePrice || item.price}
                                                    </p>
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                        <button
                                                            className="btn-sm"
                                                            onClick={() => addToCart(item)}
                                                            style={{ flex: 1 }}
                                                        >
                                                            Add to Cart
                                                        </button>
                                                        <button
                                                            className="btn-sm btn-danger"
                                                            onClick={() => removeFromWishlist(item._id)}
                                                            title="Remove"
                                                        >
                                                            <FaHeart />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        case 'payments':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Payment Methods</h2>
                                        <button className="btn">Add New Method</button>
                                    </div>
                                    <div className="address-card">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <FaCreditCard size={24} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 'bold' }}>HDFC Bank Credit Card</p>
                                                <p style={{ margin: 0, fontSize: '0.9rem' }}>**** **** **** 1234</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'rewards':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Rewards & Offers</h2>
                                    </div>
                                    <div className="form-grid">
                                        <div className="card" style={{ background: 'linear-gradient(45deg, #4f46e5, #ec4899)', color: 'white' }}>
                                            <h3>500 Points</h3>
                                            <p>Available Balance</p>
                                        </div>
                                        <div className="card">
                                            <h3>WELCOME50</h3>
                                            <p>50% off on your first order</p>
                                            <small>Valid until Dec 31, 2025</small>
                                        </div>
                                    </div>
                                </div>
                            );
                        case 'returns':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Returns & Refunds</h2>
                                    </div>
                                    <p>No active return requests.</p>
                                </div>
                            );
                        case 'communication':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Communication Preferences</h2>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                                        <label style={{ margin: 0 }}>Email Notifications for Orders</label>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input type="checkbox" defaultChecked style={{ width: 'auto' }} />
                                        <label style={{ margin: 0 }}>SMS Alerts for Delivery</label>
                                    </div>
                                    <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <input type="checkbox" style={{ width: 'auto' }} />
                                        <label style={{ margin: 0 }}>Marketing Emails & Newsletters</label>
                                    </div>
                                </div>
                            );
                        case 'security':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Security & Privacy</h2>
                                    </div>
                                    <div className="form-group">
                                        <button className="btn btn-outline">Change Password</button>
                                    </div>
                                    <div className="form-group">
                                        <button className="btn btn-outline">Enable Two-Factor Authentication</button>
                                    </div>
                                    <div className="form-group" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                                        <h4 style={{ color: '#ef4444' }}>Delete Account</h4>
                                        <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Permanently delete your account and all data.</p>
                                        <button className="btn btn-danger">Delete Account</button>
                                    </div>
                                </div>
                            );
                        case 'support':
                            return (
                                <div>
                                    <div className="section-header">
                                        <h2>Support & Help</h2>
                                    </div>
                                    <div className="form-grid">
                                        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => window.dispatchEvent(new Event('openChat'))}>
                                            <FaHeadset size={30} style={{ marginBottom: '1rem', color: 'var(--primary-color)' }} />
                                            <h3>Chat Support</h3>
                                            <p>Talk to our agents</p>
                                        </div>
                                        <div className="card" style={{ textAlign: 'center', cursor: 'pointer' }}>
                                            <FaEnvelope size={30} style={{ marginBottom: '1rem', color: 'var(--primary-color)' }} />
                                            <h3>Email Us</h3>
                                            <p>support@ecommerce.com</p>
                                        </div>
                                    </div>
                                    <div style={{ marginTop: '2rem' }}>
                                        <h3>Frequently Asked Questions</h3>
                                        <details style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>How do I track my order?</summary>
                                            <p style={{ marginTop: '1rem' }}>Go to the Orders section and click on "Track Order" for the specific item.</p>
                                        </details>
                                        <details style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>What is the return policy?</summary>
                                            <p style={{ marginTop: '1rem' }}>You can return items within 30 days of delivery.</p>
                                        </details>
                                    </div>
                                </div>
                            );
                        default:
                            return null;
                    }
                })()}
            </div>
        );
    };

    if (!user) return <div className="container" style={{ padding: '2rem' }}>Please login to view your profile.</div>;

    return (
        <div className={`container profile-page ${mobileView === 'list' ? 'mobile-list-view' : 'mobile-content-view'}`}>
            <div className="profile-sidebar">
                <div className="user-brief">
                    <div className="user-brief-avatar">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
                <nav className="profile-nav">
                    <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
                        <FaUser /> Profile Information
                    </div>
                    <div className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => handleTabChange('addresses')}>
                        <FaMapMarkerAlt /> Addresses
                    </div>
                    <div className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabChange('orders')}>
                        <FaBoxOpen /> My Orders
                    </div>
                    <div className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`} onClick={() => handleTabChange('wishlist')}>
                        <FaHeart /> Wishlist
                    </div>
                    <div className={`nav-item ${activeTab === 'payments' ? 'active' : ''}`} onClick={() => handleTabChange('payments')}>
                        <FaCreditCard /> Payment Methods
                    </div>
                    <div className={`nav-item ${activeTab === 'rewards' ? 'active' : ''}`} onClick={() => handleTabChange('rewards')}>
                        <FaGift /> Rewards & Offers
                    </div>
                    <div className={`nav-item ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => handleTabChange('returns')}>
                        <FaUndo /> Returns & Refunds
                    </div>
                    <div className={`nav-item ${activeTab === 'communication' ? 'active' : ''}`} onClick={() => handleTabChange('communication')}>
                        <FaEnvelope /> Communication
                    </div>
                    <div className={`nav-item ${activeTab === 'security' ? 'active' : ''}`} onClick={() => handleTabChange('security')}>
                        <FaShieldAlt /> Security & Privacy
                    </div>
                    <div className={`nav-item ${activeTab === 'support' ? 'active' : ''}`} onClick={() => handleTabChange('support')}>
                        <FaHeadset /> Support & Help
                    </div>
                    <div className="nav-item" onClick={logout} style={{ color: '#ef4444', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <FaSignOutAlt /> Logout
                    </div>
                </nav>
            </div>
            <div className="profile-content">
                {renderContent()}
            </div>
            {trackingOrder && (
                <div className="modal-overlay" onClick={closeTrackingModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Track Order #{trackingOrder._id.substring(0, 8)}</h3>
                            <button className="close-btn" onClick={closeTrackingModal}>&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="timeline">
                                {trackingOrder.timeline && trackingOrder.timeline.length > 0 ? (
                                    trackingOrder.timeline.map((event, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content">
                                                <h4>{event.status}</h4>
                                                <p>{event.note}</p>
                                                <small>{new Date(event.date || event.createdAt || Date.now()).toLocaleString()}</small>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No tracking information available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <button className="close-btn" onClick={() => setShowAddressModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSaveAddress}>
                            <div className="form-group">
                                <label>Address Type</label>
                                <select
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)' }}
                                    value={addressForm.type}
                                    onChange={e => setAddressForm({ ...addressForm, type: e.target.value })}
                                >
                                    <option value="Home">Home</option>
                                    <option value="Work">Work</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Address Line</label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.address}
                                    onChange={e => setAddressForm({ ...addressForm, address: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label>City</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.city}
                                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label>State</label>
                                    <input
                                        type="text"
                                        required
                                        value={addressForm.state}
                                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Zip Code</label>
                                <input
                                    type="text"
                                    required
                                    value={addressForm.zip}
                                    onChange={e => setAddressForm({ ...addressForm, zip: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    style={{ width: 'auto' }}
                                    checked={addressForm.isDefault}
                                    onChange={e => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                />
                                <label style={{ margin: 0 }}>Set as Default Address</label>
                            </div>
                            <button type="submit" className="btn" style={{ width: '100%' }}>Save Address</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
