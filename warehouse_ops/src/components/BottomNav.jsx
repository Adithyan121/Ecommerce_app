import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaBox, FaClipboardList, FaUser, FaExchangeAlt } from 'react-icons/fa';

const BottomNav = () => {
    const location = useLocation();

    // Hide bottom nav on login page
    if (location.pathname === '/login') return null;

    const navItems = [
        { path: '/', icon: <FaHome size={20} />, label: 'Home' },
        { path: '/inventory', icon: <FaBox size={20} />, label: 'Inventory' },
        { path: '/orders', icon: <FaClipboardList size={20} />, label: 'Orders' },
        // { path: '/stock/in', icon: <FaExchangeAlt size={20} />, label: 'Actions' }, // Maybe too specific?
        { path: '/profile', icon: <FaUser size={20} />, label: 'Profile' }
    ];

    return (
        <div className="bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <div className="icon-container">
                        {item.icon}
                    </div>
                </NavLink>
            ))}
        </div>
    );
};

export default BottomNav;
