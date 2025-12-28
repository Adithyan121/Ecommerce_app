import React, { useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { FaBox, FaFire, FaTruck, FaUndo, FaLock, FaHeadset, FaArrowRight } from 'react-icons/fa';
import './Home.css';
import Banner from '../components/Banner';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newArrivals, setNewArrivals] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState(8);
    const [sort, setSort] = useState('newest'); // 'newest', 'price-asc', 'price-desc'
    const { addToCart } = useContext(CartContext);
    const { keyword, categorySlug } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Categories First (needed for slug lookup)
                let currentCategories = categories;
                if (categories.length === 0) {
                    const { data: categoriesData } = await api.get('/categories');
                    setCategories(categoriesData);
                    currentCategories = categoriesData;
                }

                // Determine Category Name from Slug
                let categoryName = '';
                if (categorySlug) {
                    if (products.length > 0 && products[0].category) {
                        // Fallback or confirm from products if categories list isn't populated yet?
                        // Ideally depend on categories list but if empty, wait or use slug formatting
                    }
                    const matchedCat = currentCategories.find(c => c.slug === categorySlug);
                    if (matchedCat) {
                        categoryName = matchedCat.name;
                    } else {
                        // Fallback: format slug to title case
                        categoryName = categorySlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    }
                }

                // Fetch Products
                let url = '/products?';
                if (keyword) url += `keyword=${keyword}&`;
                if (categoryName) url += `category=${encodeURIComponent(categoryName)}&`;

                // Sort param
                let sortParam = '-createdAt';
                if (sort === 'newest') sortParam = '-createdAt,_id'; // Deterministic sort
                if (sort === 'price-asc') sortParam = 'price';
                if (sort === 'price-desc') sortParam = '-price';
                if (sort === 'category') sortParam = 'category';
                url += `sort=${sortParam}`;

                const { data: productsData } = await api.get(url);
                setProducts(productsData);

                // Logic: If searching or filtering, show all. If home, show 8 initially.
                if (keyword || categorySlug) {
                    setVisibleProducts(productsData.length);
                } else {
                    setVisibleProducts(8);
                }

                // Simulate "New Arrivals" (just taking the last 4 products for now)
                if (!categorySlug && !keyword) {
                    setNewArrivals(productsData.slice(-4).reverse());
                }

            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, [keyword, categorySlug, sort]);



    const pageTitle = keyword
        ? `Search results for "${keyword}" | ShopWave`
        : (categorySlug ? `${categorySlug.replace(/-/g, ' ')} | ShopWave` : 'ShopWave | Best Online Shopping');

    return (
        <div className="home-page">
            <Helmet>
                <title style={{ textTransform: 'capitalize' }}>{pageTitle}</title>
                <meta name="description" content={keyword ? `Explore the best results for ${keyword} at ShopWave.` : 'ShopWave offers the best deals on electronics, fashion, and more.'} />
                <meta name="keywords" content={keyword ? `${keyword}, shop, online, deals` : 'ecommerce, shop, deals, fashion, electronics'} />
            </Helmet>
            {/* 2️⃣ Hero Banner / Main Slider */}
            {/* 2️⃣ Hero Banner / Main Slider */}
            {!keyword && !categorySlug && <Banner />}
            <div className="container">
                {/* 3️⃣ Featured Categories */}
                {!keyword && !categorySlug && categories.length > 0 && (
                    <section className="categories-section">
                        <h2 className="section-title">Shop by Category</h2>
                        <div className="categories-grid">
                            {categories.map(cat => (
                                <Link key={cat._id} to={`/category/${cat.slug}`} className="category-card">
                                    <div className="category-icon"><FaBox /></div>
                                    <span>{cat.name}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* 4️⃣ Featured Products */}
                <section className="products-section">
                    <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 className="section-title" style={{ margin: 0 }}>
                            {keyword ? `Search Results for "${keyword}"` : categorySlug ? `Category: ${categories.find(c => c.slug === categorySlug)?.name || categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}` : 'Featured Products'}
                        </h2>

                        <div className="header-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {(keyword || categorySlug) && (
                                <Link to="/" className="btn btn-outline" style={{ fontSize: '0.9rem', textDecoration: 'none', padding: '0.4rem 1rem', border: '1px solid var(--primary-color)', borderRadius: '4px', color: 'var(--primary-color)' }}>
                                    View All Products
                                </Link>
                            )}

                            <div className="sort-filter">
                                <select value={sort} onChange={(e) => setSort(e.target.value)}>
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="category">Category (A-Z)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="product-grid">
                        {products.slice(0, visibleProducts).map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {visibleProducts < products.length && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => setVisibleProducts(prev => prev + 8)}
                                style={{
                                    border: '1px solid var(--primary-color)',
                                    color: 'var(--primary-color)',
                                    padding: '0.6rem 2rem',
                                    borderRadius: '50px',
                                    background: 'transparent',
                                    fontWeight: 600,
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => { e.target.style.background = 'var(--primary-color)'; e.target.style.color = 'white'; }}
                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--primary-color)'; }}
                            >
                                View More Products
                            </button>
                        </div>
                    )}
                </section>

                {/* 5️⃣ Special Offers Section */}
                {!keyword && !categorySlug && (
                    <section className="special-offers">
                        <div className="offer-banner">
                            <div className="offer-content">
                                <h2><FaFire /> Flash Sale! Up to 50% Off</h2>
                                <p>Grab your favorites before they are gone. Limited time offer.</p>
                                <div className="timer">
                                    <span>02</span> : <span>14</span> : <span>35</span>
                                </div>
                                <Link to="/sales" className="btn btn-light">View Offers</Link>
                            </div>
                        </div>
                    </section>
                )}

                {/* 6️⃣ New Arrivals */}
                {!keyword && !categorySlug && newArrivals.length > 0 && (
                    <section className="products-section">
                        <div className="section-header">
                            <h2 className="section-title">New Arrivals</h2>
                            {/* Link to all products sorted by newest (default view) */}
                            <Link to="/" onClick={() => { setSort('newest'); window.scrollTo(0, 0); }} className="view-all">View All <FaArrowRight /></Link>
                        </div>
                        <div className="product-grid">
                            {newArrivals.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    </section>
                )}

                {/* 7️⃣ Why Choose Us */}
                {!keyword && !categorySlug && (
                    <section className="features-section">
                        <div className="feature-item">
                            <div className="feature-icon"><FaTruck /></div>
                            <h3>Free Shipping</h3>
                            <p>On all orders over ₹500</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaUndo /></div>
                            <h3>Easy Returns</h3>
                            <p>30-day return policy</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaLock /></div>
                            <h3>Secure Payments</h3>
                            <p>100% secure checkout</p>
                        </div>
                        <div className="feature-item">
                            <div className="feature-icon"><FaHeadset /></div>
                            <h3>24/7 Support</h3>
                            <p>Dedicated support team</p>
                        </div>
                    </section>
                )}

                {/* 8️⃣ Newsletter Signup */}
                {!keyword && !categorySlug && (
                    <section className="newsletter-section">
                        <div className="newsletter-content">
                            <h2>Subscribe to our Newsletter</h2>
                            <p>Get the latest updates on new products and upcoming sales.</p>
                            <form className="newsletter-form-home">
                                <input type="email" placeholder="Enter your email address" />
                                <button type="submit" className="btn btn-primary">Subscribe</button>
                            </form>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default Home;
