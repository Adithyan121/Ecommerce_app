import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import './Banner.css';

const Banner = () => {
    const [banners, setBanners] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);

    const defaultBanners = [
        {
            _id: 'default-1',
            title: 'Nike Air Max 270',
            subtitle: 'Run!',
            description: 'Try out the new model. Better running more Performance!',
            image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/97f023f0-424a-471a-a035-4876b53a0601/air-max-270-shoes-P0jVqP.png', // Similar Nike shoe
            link: '/shop',
            btnText: 'Try it now',
            backgroundColor: '#8FD3F4', // Light blue from image
            textColor: '#ffffff'
        }
    ];

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await api.get('/banners');
                if (data && data.length > 0) {
                    setBanners(data);
                } else {
                    setBanners(defaultBanners);
                }
            } catch (error) {
                console.error("Failed to fetch banners", error);
                setBanners(defaultBanners);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    useEffect(() => {
        if (banners.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(interval);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    if (loading) return null;

    return (
        <div className="nike-banner-container">
            {/* Top Left Logo */}
            <div className="nike-logo-container">
                {/* SVG for simpler usage or img */}
                {/* <svg viewBox="0 0 24 24" className="nike-logo-svg" fill="currentColor">
                    <path d="M21.196 6.982c-1.854 1.34-4.823 2.507-7.39 3.08-1.503.336-6.19.866-9.136-1.122-1.996-1.345-2.268-3.04-1.1-4.717.387-.557.876-.948 1.48-1.18.232-.088-.306-.118-.387-.118-4.99 0-4.086 5.86-1.077 7.91 3.23 2.2 7.828 1.5 9.773 1.078 2.05-.443 6.096-1.85 7.837-4.93z" />
                </svg> */}
            </div>

            {banners.map((banner, index) => (
                <div
                    key={banner._id}
                    className={`nike-slide ${index === currentSlide ? 'active' : ''}`}
                    style={{ background: `linear-gradient(120deg, ${banner.bgGradientStart || '#8FD3F4'} 0%, ${banner.bgGradientEnd || '#a2d9ff'} 100%)` }}
                >
                    {/* Decorative Circle */}
                    <div className="decorative-circle"></div>

                    <div className="nike-slide-content container">
                        <div className="nike-text-section">
                            <h1 className="nike-title" style={{ color: banner.titleColor || '#fff' }}>
                                {banner.title}
                            </h1>
                            {banner.subtitle && (
                                <h2 className="nike-subtitle" style={{ color: banner.subtitleColor || '#5d67a6', mixBlendMode: 'normal' }}>
                                    {banner.subtitle}
                                </h2>
                            )}

                            {banner.description && (
                                <div className="nike-description" style={{ color: banner.descColor || '#fff' }}>
                                    {banner.description.split('.').map((line, i) => (
                                        <p key={i}>{line.trim()}</p>
                                    ))}
                                </div>
                            )}

                            <div className="nike-cta-section">
                                <span className="cta-label" style={{ color: banner.descColor || '#fff' }}></span>
                                <Link
                                    to={banner.link || '/shop'}
                                    className="nike-btn"
                                    style={{
                                        backgroundColor: banner.btnBgColor || '#7b8de6',
                                        color: banner.btnTextColor || '#fff',
                                        background: banner.btnBgColor ? banner.btnBgColor : 'linear-gradient(to right, #7b8de6, #6c7cd4)',
                                        borderRadius: `${banner.btnRadius || 30}px`
                                    }}
                                >
                                    {banner.btnText || 'Try it now'}
                                </Link>
                            </div>

                            {/* Thumbnails Section integrated in left side */}
                            {/* Thumbnails Section integrated in left side */}
                            {(banner.showThumbnails !== false) && (
                                <div className="nike-thumbnails-list">
                                    {(banner.thumbnails && banner.thumbnails.length > 0 ? banner.thumbnails : []).map((thumb, idx) => (
                                        <div
                                            key={idx}
                                            className={`nike-thumbnail-card ${idx === 0 ? 'active-thumb' : ''}`}
                                        >
                                            <div className="thumb-info">
                                                <span className="thumb-placeholder">{thumb.title || 'Placeholder'}</span>
                                                <span className="thumb-price">₹ {thumb.price || '0'}</span>
                                            </div>
                                            {thumb.image && <img src={thumb.image} alt={thumb.title} className="thumb-image" />}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="nike-image-section">
                            <div className="product-card-bg">
                                <img src={banner.image} alt={banner.title} className="nike-shoe-image" />
                                {/* Dots under the shoe in right section */}
                                <div className="shoe-dots">
                                    {banners.map((_, i) => (
                                        <span
                                            key={i}
                                            className={`shoe-dot ${i === currentSlide ? 'active' : ''}`}
                                            onClick={() => setCurrentSlide(i)}
                                            style={{ cursor: 'pointer' }}
                                        ></span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Banner;
