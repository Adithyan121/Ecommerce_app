import React, { useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import './Checkout.css';

const Checkout = () => {
    const { cartItems, cartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [shippingAddress, setShippingAddress] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const handleAddressChange = (e) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const applyCoupon = async () => {
        try {
            const { data } = await api.post('/coupons/validate', {
                code: couponCode,
                cartTotal
            });

            let discountAmount = 0;
            if (data.type === 'percentage') {
                discountAmount = (cartTotal * data.value) / 100;
            } else {
                discountAmount = data.value;
            }
            setDiscount(discountAmount);
            toast.success('Coupon Applied!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid Coupon');
        }
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            toast.error("Please login to place order");
            return;
        }
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item._id,
                    name: item.name,
                    image: item.images?.[0] || item.image || 'https://via.placeholder.com/150',
                    price: item.salePrice || item.price,
                    qty: item.qty,
                    variant: item.selectedVariant || null
                })),
                shippingAddress,
                paymentMethod,
                itemsPrice: cartTotal,
                shippingPrice: 0,
                taxPrice: 0,
                discountPrice: discount,
                totalPrice: (cartTotal - discount) > 0 ? (cartTotal - discount) : 0,
                user: user._id
            };

            // 1. Create Order in DB
            const { data: createdOrder } = await api.post('/orders', orderData);

            // 2. Handle Payment
            if (paymentMethod === 'Razorpay') {
                const { data: { key } } = await api.get('/payment/get-key');
                const { data: order } = await api.post('/payment/orders', { amount: createdOrder.totalPrice });

                const options = {
                    key,
                    amount: order.amount,
                    currency: "INR",
                    name: "E-Commerce App",
                    description: "Order Payment",
                    image: "https://example.com/logo.png", // Replace with actual logo
                    order_id: order.id,
                    handler: async function (response) {
                        try {
                            await api.post('/payment/verify', {
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            });

                            await api.put(`/orders/${createdOrder._id}/pay`, {
                                id: response.razorpay_payment_id,
                                status: 'COMPLETED',
                                update_time: new Date().toISOString(),
                                email_address: user.email
                            });

                            toast.success('Payment Successful');
                            clearCart();
                            navigate('/profile');
                        } catch (error) {
                            toast.error('Payment Verification Failed');
                            console.error(error);
                        }
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                        contact: shippingAddress.phone
                    },
                    theme: {
                        color: "#3399cc"
                    }
                };

                const rzp1 = new window.Razorpay(options);
                rzp1.open();
            } else {
                toast.success('Order Placed Successfully');
                clearCart();
                navigate('/profile');
            }

        } catch (error) {
            console.error("Order Error", error);
            toast.error('Failed to place order');
        }
    };

    if (cartItems.length === 0) return <div className="container">Your cart is empty</div>;

    return (
        <div className="container checkout-page">
            <h1>Checkout</h1>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
                Placing order as: <strong>{user?.name}</strong> ({user?.email})
            </p>
            {user?.isAdmin && (
                <div style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                    border: '1px solid #f87171'
                }}>
                    <strong>⚠️ Warning:</strong> You are logged in as an Administrator.
                    This order will be linked to the Admin account, not a customer account.
                    <button
                        onClick={() => {
                            localStorage.removeItem('userInfo');
                            window.location.href = '/login';
                        }}
                        style={{
                            marginLeft: '1rem',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#991b1b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.25rem',
                            cursor: 'pointer'
                        }}
                    >
                        Logout & Switch to Customer
                    </button>
                </div>
            )}
            <div className="checkout-grid">
                <div className="shipping-form card">
                    <h2>Shipping Address</h2>
                    <form onSubmit={placeOrder}>
                        <div className="form-group">
                            <label>Address</label>
                            <input type="text" name="address" onChange={handleAddressChange} required />
                        </div>
                        <div className="form-group">
                            <label>City</label>
                            <input type="text" name="city" onChange={handleAddressChange} required />
                        </div>
                        <div className="form-group">
                            <label>Postal Code</label>
                            <input type="text" name="postalCode" onChange={handleAddressChange} required />
                        </div>
                        <div className="form-group">
                            <label>Country</label>
                            <input type="text" name="country" onChange={handleAddressChange} required />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input type="text" name="phone" onChange={handleAddressChange} required />
                        </div>

                        <h2>Payment Method</h2>
                        <div className="form-group">
                            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                                <option value="COD">Cash on Delivery</option>
                                <option value="Razorpay">Razorpay (Online)</option>
                            </select>
                        </div>

                        <button type="submit" className="btn btn-block">Place Order</button>
                    </form>
                </div>

                <div className="order-summary card">
                    <h2>Order Summary</h2>
                    {cartItems.map(item => (
                        <div key={item._id} className="summary-item" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                                <img
                                    src={item.images?.[0] || item.image || 'https://via.placeholder.com/150'}
                                    alt={item.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.25rem', fontWeight: '500' }}>{item.name}</p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                                    Qty: {item.qty} {item.selectedVariant && <span>| {typeof item.selectedVariant === 'object' ? Object.values(item.selectedVariant).join(', ') : item.selectedVariant}</span>}
                                </p>
                            </div>
                            <div style={{ fontWeight: '600' }}>
                                ₹{(item.salePrice || item.price) * item.qty}
                            </div>
                        </div>
                    ))}
                    <div className="coupon-section">
                        <input
                            type="text"
                            placeholder="Coupon Code"
                            value={couponCode}
                            className="coupon-input"
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <button type="button" className="btn" onClick={applyCoupon}>Apply</button>
                    </div>
                    <div className="summary-totals">
                        <p>Subtotal: ₹{cartTotal}</p>
                        <p>Discount: -₹{discount}</p>
                        <h3>Total: ₹{cartTotal - discount}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
