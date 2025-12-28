import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { SOCKET_URL } from '../api';
import { FaChartBar, FaBox, FaFolder, FaShoppingBag, FaUsers, FaChartLine, FaIndustry, FaTruck, FaBullhorn, FaTicketAlt, FaStar, FaPen, FaCog, FaSignOutAlt, FaHeadset } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const socket = io.connect(SOCKET_URL);
        socket.emit('join_support');

        socket.on('receive_message', (data) => {
            // If message is from user (not admin) and we are not on support page
            if (!data.isAdmin) {
                setHasUnread(true);
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (location.pathname === '/support') {
            setHasUnread(false);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const menuItems = [
        { path: '/', label: 'Dashboard', icon: <FaChartBar /> },
        { path: '/products', label: 'Products', icon: <FaBox /> },
        { path: '/categories', label: 'Categories', icon: <FaFolder /> },
        { path: '/orders', label: 'Orders', icon: <FaShoppingBag /> },
        { path: '/customers', label: 'User Management', icon: <FaUsers /> },
        {
            path: '/support',
            label: 'Support Chat',
            icon: (
                <div style={{ position: 'relative' }}>
                    <FaHeadset />
                    {hasUnread && <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'red',
                        borderRadius: '50%',
                        border: '2px solid #1f2937'
                    }} />}
                </div>
            )
        },
        { path: '/analytics', label: 'Analytics', icon: <FaChartLine /> },
        { path: '/inventory', label: 'Inventory', icon: <FaIndustry /> },
        { path: '/shipping', label: 'Shipping', icon: <FaTruck /> },
        { path: '/marketing', label: 'Marketing', icon: <FaBullhorn /> },
        { path: '/coupons', label: 'Coupons', icon: <FaTicketAlt /> },
        { path: '/reviews', label: 'Reviews', icon: <FaStar /> },
        { path: '/cms', label: 'CMS', icon: <FaPen /> },
        { path: '/banners', label: 'Banners', icon: <FaBox /> },
        { path: '/settings', label: 'Settings', icon: <FaCog /> },
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="label">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}><FaSignOutAlt /> Logout</button>
            </div>
        </aside>
    );
};

export default Sidebar;
