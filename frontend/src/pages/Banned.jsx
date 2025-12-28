import React from 'react';
import { FaBan, FaEnvelope } from 'react-icons/fa';
import './Auth.css';

const Banned = () => {
    return (
        <div className="auth-container container" style={{ textAlign: 'center' }}>
            <div className="auth-card card" style={{ padding: '3rem', borderTop: '4px solid #ef4444' }}>
                <FaBan size={60} color="#ef4444" style={{ marginBottom: '1rem' }} />
                <h1 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h1>
                <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
                    Your account has been permanently suspended due to a violation of our terms of service.
                </p>

                <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2', marginBottom: '2rem' }}>
                    <p style={{ margin: 0, color: '#991b1b' }}>
                        If you believe this is a mistake, please contact our support team.
                    </p>
                </div>

                <a href="mailto:support@ecommerce.com" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FaEnvelope /> Contact Support
                </a>

                <div style={{ marginTop: '2rem' }}>
                    <a href="/" style={{ color: '#666', fontSize: '0.9rem' }}>Return to Home</a>
                </div>
            </div>
        </div>
    );
};

export default Banned;
