import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaClipboardList, FaDollyFlatbed, FaSignOutAlt, FaSync } from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const u = localStorage.getItem('userInfo');
        if (!u) navigate('/login');
        else setUser(JSON.parse(u));
    }, [navigate]);



    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="navbar" style={{ marginBottom: '1rem', background: 'transparent' }}>
                <h2 style={{ color: 'var(--primary-color)' }}>Warehouse Ops</h2>
                <Link to="/profile">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem', color: '#fff' }}>{user?.name?.charAt(0).toUpperCase()}</span>
                    </div>
                </Link>
            </div>

            {user && <p style={{ marginBottom: '2rem' }}>Welcome, <strong>{user.name}</strong></p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Link to="/stock/in" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'linear-gradient(145deg, #1e1e1e, #252525)' }}>
                        <FaBoxOpen size={32} color="var(--secondary-color)" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Stock In</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Receiving</span>
                    </div>
                </Link>

                <Link to="/stock/out" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'linear-gradient(145deg, #1e1e1e, #252525)' }}>
                        <FaDollyFlatbed size={32} color="#ffb74d" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Stock Out</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Picking</span>
                    </div>
                </Link>

                <Link to="/stock/adjust" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'linear-gradient(145deg, #1e1e1e, #252525)' }}>
                        <FaSync size={32} color="#bb86fc" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Adjust</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Corrections</span>
                    </div>
                </Link>

                <Link to="/inventory" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'linear-gradient(145deg, #1e1e1e, #252525)' }}>
                        <FaClipboardList size={32} color="#4db6ac" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Lookup</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Check Stock</span>
                    </div>
                </Link>

                <Link to="/put-away" style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '140px', background: 'linear-gradient(145deg, #1e1e1e, #252525)' }}>
                        <FaDollyFlatbed size={32} color="#81c784" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Put Away</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Staging → Bin</span>
                    </div>
                </Link>

                <Link to="/orders" style={{ textDecoration: 'none', gridColumn: 'span 2' }}>
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', background: 'linear-gradient(145deg, #1565c0, #0d47a1)' }}>
                        <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>Manage Orders</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Receipts & Picks</span>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;
