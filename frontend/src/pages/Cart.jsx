import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

import './Cart.css';

const Cart = () => {
    const { cartItems, removeFromCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const totalPrice = cartItems.reduce((acc, item) => acc + (item.salePrice || item.price) * item.qty, 0);

    const checkoutHandler = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    return (
        <div className="cart-page container">
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty <Link to="/">Go Back</Link></p>
            ) : (
                <div className="cart-content">
                    <div className="cart-items">
                        {cartItems.map((item) => (
                            <div key={item._id} className="cart-item card">
                                <img src={item.image} alt={item.name} />
                                <div className="item-details">
                                    <Link to={`/product/${item._id}`}>{item.name}</Link>
                                    <p>₹{item.salePrice || item.price}</p>
                                </div>
                                <div className="item-actions">
                                    <p>Qty: {item.qty}</p>
                                    <button className="btn-remove" onClick={() => removeFromCart(item._id)}>
                                        <i className="fas fa-trash"></i> Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary card">
                        <h2>Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) items</h2>
                        <p className="total-price">₹{totalPrice.toFixed(2)}</p>
                        <button
                            className="btn btn-block"
                            disabled={cartItems.length === 0}
                            onClick={checkoutHandler}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
