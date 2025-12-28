import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { WishlistContext } from '../context/WishlistContext';
import { FaHeart, FaEye, FaBalanceScale, FaStar, FaRegStar } from 'react-icons/fa';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);
    const [timeLeft, setTimeLeft] = useState(null);

    const inWishlist = isInWishlist(product._id);

    const handleWishlistClick = () => {
        if (inWishlist) {
            removeFromWishlist(product._id);
        } else {
            addToWishlist(product);
        }
    };

    // Calculate Discount Percentage
    const discountPercentage = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    // Countdown Timer Logic
    useEffect(() => {
        if (product.flashSaleEndDate) {
            const calculateTimeLeft = () => {
                const difference = new Date(product.flashSaleEndDate) - new Date();
                if (difference > 0) {
                    return {
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60)
                    };
                }
                return null;
            };

            setTimeLeft(calculateTimeLeft());
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [product.flashSaleEndDate]);

    return (
        <div className="product-card">
            {/* Image Wrapper */}
            <div className="product-image-wrapper">
                <Link to={`/product/${product._id}`}>
                    <img
                        src={product.images?.[0] || product.image}
                        alt={product.name}
                        className="main-img"
                    />
                    {/* Show second image on hover if available */}
                    {product.images?.[1] && (
                        <img
                            src={product.images[1]}
                            alt={product.name}
                            className="hover-img"
                        />
                    )}
                </Link>

                {/* Badges */}
                <div className="product-badges">
                    {discountPercentage > 0 && (
                        <span className="badge discount">-{discountPercentage}%</span>
                    )}
                    {product.isNewArrival && <span className="badge new">New</span>}
                    {product.isBestseller && <span className="badge bestseller">Best</span>}
                    {product.stock > 0 && product.stock < 5 && (
                        <span className="badge stock-low">Low Stock</span>
                    )}
                    {product.stock === 0 && (
                        <span className="badge stock-out">Out of Stock</span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    className={`wishlist-btn ${inWishlist ? 'active' : ''}`}
                    onClick={handleWishlistClick}
                    aria-label={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                    style={{ color: inWishlist ? '#ef4444' : 'inherit' }}
                >
                    <FaHeart />
                </button>

                {/* Quick Actions Overlay */}
                <div className="product-actions">
                    <button className="action-btn" title="Quick View"><FaEye /></button>
                    <button className="action-btn" title="Compare"><FaBalanceScale /></button>
                </div>
            </div>

            {/* Product Details */}
            <div className="product-details">
                {product.brand && <span className="product-brand">{product.brand}</span>}

                <Link to={`/product/${product._id}`} className="product-title">
                    {product.name}
                </Link>

                {/* Rating */}
                <div className="product-rating">
                    <span className="stars">
                        {[...Array(5)].map((_, i) => (
                            i < Math.round(product.rating || 0) ? <FaStar key={i} /> : <FaRegStar key={i} />
                        ))}
                    </span>
                    <span className="review-count">({product.numReviews || 0})</span>
                </div>

                {/* Price */}
                <div className="product-price">
                    {product.salePrice ? (
                        <>
                            <span className="current-price">₹{product.salePrice}</span>
                            <span className="original-price">₹{product.price}</span>
                        </>
                    ) : (
                        <span className="current-price">₹{product.price}</span>
                    )}
                </div>

                {/* Variant Previews (Mockup for now, can be dynamic based on variants) */}
                {product.variants && product.variants.length > 0 && (
                    <div className="product-variants">
                        {/* Just showing generic dots for visual representation as requested */}
                        <span className="variant-dot" style={{ background: '#000' }}></span>
                        <span className="variant-dot" style={{ background: '#888' }}></span>
                        <span className="variant-dot" style={{ background: '#f00' }}></span>
                    </div>
                )}

                {/* Flash Sale Timer */}
                {timeLeft && (
                    <div className="flash-sale-timer">
                        Ends in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                    </div>
                )}

                {/* Add to Cart Button */}
                <button
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.stock === 0}
                    style={product.stock === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
