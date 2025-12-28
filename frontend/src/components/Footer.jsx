import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container footer-container">
                <div className="footer-section">
                    <h3>ShopWave</h3>
                    <p>Your one-stop shop for everything.</p>
                    <div className="social-icons">
                        <a href="#" aria-label="Facebook"><FaFacebook /></a>
                        <a href="#" aria-label="Twitter"><FaTwitter /></a>
                        <a href="#" aria-label="Instagram"><FaInstagram /></a>
                    </div>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/page/about-us">About Us</a></li>
                        <li><a href="/contact">Contact</a></li>
                        <li><a href="/page/privacy-policy">Privacy Policy</a></li>
                        <li><a href="/page/terms-of-service">Terms of Service</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Customer Service</h4>
                    <ul>
                        <li><a href="/faq">FAQ</a></li>
                        <li><a href="/shipping">Shipping Info</a></li>
                        <li><a href="/returns">Returns</a></li>
                        <li><a href="/track">Track Order</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Newsletter</h4>
                    <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                    <form className="newsletter-form">
                        <input type="email" placeholder="Enter your email" />
                        <button type="submit">Subscribe</button>
                    </form>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} ShopWave. All Rights Reserved.</p>
                <div className="payment-icons">
                    <span><FaCcVisa /></span>
                    <span><FaCcMastercard /></span>
                    <span><FaPaypal /></span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
