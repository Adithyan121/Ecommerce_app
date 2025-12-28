import React, { useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import toast from 'react-hot-toast';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { WishlistContext } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { FaStar, FaRegStar, FaHeart, FaArrowLeft } from 'react-icons/fa';
import './ProductDetails.css';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedVariant, setSelectedVariant] = useState({});
    const [qty, setQty] = useState(1);
    const [activeTab, setActiveTab] = useState('description');
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [displayImages, setDisplayImages] = useState([]); // Images to show in gallery

    // Review State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { addToWishlist, removeFromWishlist, isInWishlist } = useContext(WishlistContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
                setSelectedImage(data.images?.[0] || data.image);

                // Initialize variants
                if (data.variants && data.variants.length > 0) {
                    const initialVariants = {};
                    data.variants.forEach(v => {
                        if (v.options.length > 0) initialVariants[v.name] = v.options[0].value;
                    });
                    setSelectedVariant(initialVariants);
                }

                setDisplayImages(data.images?.length > 0 ? data.images : (data.image ? [data.image] : []));

                // Fetch Related Products
                const { data: related } = await api.get(`/products/related/${id}`);
                setRelatedProducts(related);

            } catch (error) {
                console.error(error);
            }
        };
        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (!product || !product.variants) return;

        let specificImages = [];
        product.variants.forEach(variant => {
            const selectedValue = selectedVariant[variant.name];
            if (selectedValue) {
                const option = variant.options.find(o => o.value === selectedValue);
                if (option && option.images && option.images.length > 0) {
                    specificImages = [...specificImages, ...option.images];
                }
            }
        });

        // Unique images only
        specificImages = [...new Set(specificImages)];

        if (specificImages.length > 0) {
            setDisplayImages(specificImages);
            // Only change selected image if the current one is not in the new list
            if (!specificImages.includes(selectedImage)) {
                setSelectedImage(specificImages[0]);
            }
        } else {
            // Revert to all images
            setDisplayImages(product.images?.length > 0 ? product.images : (product.image ? [product.image] : []));
        }
    }, [selectedVariant, product]);

    const handleAddToCart = () => {
        addToCart({ ...product, selectedVariant, qty });
    };

    const handleBuyNow = () => {
        addToCart({ ...product, selectedVariant, qty });
        navigate('/cart');
    };

    const checkDelivery = () => {
        if (pincode.length === 6) {
            setDeliveryStatus('Available for delivery by ' + new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toDateString());
        } else {
            setDeliveryStatus('Invalid Pincode');
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        if (!user || !user.token) {
            toast.error('Please login to review');
            return;
        }
        try {
            await api.post(`/reviews/${id}`, { rating, comment });
            toast.success('Review Submitted!');
            setComment('');
            // Refetch
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error submitting review');
        }
    };

    if (!product) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>;

    const discountPercentage = product.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 0;

    return (
        <div className="product-details-page container">
            <Helmet>
                <title>{product.seo?.metaTitle || product.name || 'ShopWave Product'}</title>
                <meta name="description" content={product.seo?.metaDescription || product.description.substring(0, 160)} />
                <meta name="keywords" content={product.tags?.join(', ') || product.category} />
            </Helmet>
            <Link to="/" className="btn-back"><FaArrowLeft /> Back to Shopping</Link>

            <div className="product-details-grid">
                {/* Left: Images */}
                <div className="product-image-container">
                    <div className="main-image-wrapper">
                        <img src={selectedImage} alt={product.name} className="main-image" />
                    </div>
                    <div className="image-thumbnails">
                        {displayImages.map((img, index) => (
                            <img
                                key={index}
                                src={img}
                                alt={`Thumbnail ${index}`}
                                onClick={() => setSelectedImage(img)}
                                className={selectedImage === img ? 'active' : ''}
                            />
                        ))}
                    </div>
                </div>

                {/* Right: Info */}
                <div className="product-info-container">
                    {product.brand && <span className="brand-name">{product.brand}</span>}
                    <h1>{product.name}</h1>

                    <div className="rating-row">
                        <span className="stars">
                            {[...Array(5)].map((_, i) => (
                                i < Math.round(product.rating || 0) ? <FaStar key={i} /> : <FaRegStar key={i} />
                            ))}
                        </span>
                        <span className="review-count">({product.numReviews || 0} Reviews)</span>
                        {product.stock > 0 ? (
                            <span className="in-stock" style={{ color: '#10b981', fontWeight: 600, marginLeft: 'auto' }}>In Stock</span>
                        ) : (
                            <span className="out-of-stock" style={{ color: '#ef4444', fontWeight: 600, marginLeft: 'auto' }}>Out of Stock</span>
                        )}
                    </div>

                    <div className="price-row">
                        {product.salePrice ? (
                            <>
                                <span className="current-price">₹{product.salePrice}</span>
                                <span className="original-price">₹{product.price}</span>
                                <span className="discount-badge">-{discountPercentage}% OFF</span>
                            </>
                        ) : (
                            <span className="current-price">₹{product.price}</span>
                        )}
                    </div>

                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {product.tags && product.tags.map((tag, index) => (
                            <Link key={index} to={`/search/${tag}`} style={{ fontSize: '0.8rem', color: 'var(--primary-color)', background: 'var(--background-color)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', textDecoration: 'none' }}>
                                #{tag}
                            </Link>
                        ))}
                    </div>

                    <p className="product-description" style={{ marginBottom: '2rem', color: '#555' }}>
                        {product.description.substring(0, 150)}...
                    </p>

                    {/* Variants */}
                    {product.variants && product.variants.length > 0 && (
                        <div className="variants-section">
                            {product.variants.map((variant, index) => (
                                <div key={index} className="variant-group">
                                    <h4>{variant.name}: <span style={{ fontWeight: 400 }}>{selectedVariant[variant.name]}</span></h4>
                                    <div className="variant-options">
                                        {variant.options.map((option, idx) => (
                                            <button
                                                key={idx}
                                                className={`btn-variant ${selectedVariant[variant.name] === option.value ? 'active' : ''}`}
                                                onClick={() => setSelectedVariant({ ...selectedVariant, [variant.name]: option.value })}
                                            >
                                                {option.value}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="actions-row">
                        <div className="qty-selector">
                            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
                            <input type="text" value={qty} readOnly className="qty-input" />
                            <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
                        </div>
                        <button
                            className="btn-add-cart"
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                        >
                            Add to Cart
                        </button>
                        <button
                            className="btn-buy-now"
                            onClick={handleBuyNow}
                            disabled={product.stock === 0}
                        >
                            Buy Now
                        </button>
                        <button
                            className={`btn-wishlist ${product && isInWishlist(product._id) ? 'active' : ''}`}
                            onClick={() => {
                                if (isInWishlist(product._id)) {
                                    removeFromWishlist(product._id);
                                } else {
                                    addToWishlist(product);
                                }
                            }}
                            style={{ color: product && isInWishlist(product._id) ? '#ef4444' : 'inherit' }}
                        >
                            <FaHeart />
                        </button>
                    </div>

                    {/* Delivery */}
                    <div className="delivery-check">
                        <h4>Delivery Options</h4>
                        <div className="pincode-input-group">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                maxLength="6"
                            />
                            <button onClick={checkDelivery}>Check</button>
                        </div>
                        {deliveryStatus && <p style={{ marginTop: '0.5rem', color: deliveryStatus.includes('Invalid') ? 'red' : 'green' }}>{deliveryStatus}</p>}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="product-sections">
                <div className="section-tabs">
                    {['description', 'specifications', 'reviews'].map(tab => (
                        <button
                            key={tab}
                            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="section-content">
                    {activeTab === 'description' && (
                        <div>
                            <h3>Product Description</h3>
                            <p>{product.description}</p>
                            {product.highlights && (
                                <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                                    {product.highlights.map((h, i) => <li key={i}>{h}</li>)}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'specifications' && (
                        <div>
                            <h3>Technical Specifications</h3>
                            <table className="spec-table">
                                <tbody>
                                    {product.attributes?.map((attr, i) => (
                                        <tr key={i}>
                                            <th>{attr.key}</th>
                                            <td>{attr.value}</td>
                                        </tr>
                                    ))}
                                    {product.weight && <tr><th>Weight</th><td>{product.weight} kg</td></tr>}
                                    {product.warranty && <tr><th>Warranty</th><td>{product.warranty}</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div>
                            <h3>Customer Reviews</h3>
                            {product.reviews?.length === 0 && <p>No reviews yet. Be the first to review!</p>}
                            {product.reviews?.map(review => (
                                <div key={review._id} className="review-item">
                                    <div className="review-header">
                                        <span className="review-author">{review.name}</span>
                                        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="stars" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                        {[...Array(5)].map((_, i) => (
                                            i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                                        ))}
                                    </div>
                                    <p>{review.comment}</p>
                                </div>
                            ))}

                            <div className="add-review" style={{ marginTop: '2rem', background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                <h4>Write a Review</h4>
                                <form onSubmit={submitReview}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                                        <select
                                            value={rating}
                                            onChange={(e) => setRating(e.target.value)}
                                            style={{
                                                padding: '0.5rem',
                                                width: '100%',
                                                background: 'var(--background-color)',
                                                color: 'var(--text-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '4px'
                                            }}
                                        >
                                            <option value="5">5 - Excellent</option>
                                            <option value="4">4 - Very Good</option>
                                            <option value="3">3 - Good</option>
                                            <option value="2">2 - Fair</option>
                                            <option value="1">1 - Poor</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                minHeight: '100px',
                                                background: 'var(--background-color)',
                                                color: 'var(--text-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '4px'
                                            }}
                                        ></textarea>
                                    </div>
                                    <button type="submit" className="btn">Submit Review</button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Products */}
            {
                relatedProducts.length > 0 && (
                    <div className="related-products">
                        <h2>Related Products</h2>
                        <div className="product-grid">
                            {relatedProducts.map(p => (
                                <ProductCard key={p._id} product={p} />
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ProductDetails;
