import React, { useContext, useState, useEffect } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext';
import { FaSun, FaMoon, FaSearch, FaBell, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [unreadCount, setUnreadCount] = useState(0);
    const [userName, setUserName] = useState('Admin');

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const { data } = await api.get('/notifications');
                const unread = data.filter(n => !n.isRead).length;
                setUnreadCount(unread);
            } catch (error) {
                console.error("Error fetching notifications", error);
            }
        };

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.name) {
            setUserName(userInfo.name);
        }

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="admin-navbar">
            <div className="navbar-left">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input type="text" placeholder="Search..." />
                </div>
            </div>

            <div className="navbar-right">
                <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>

                <Link to="/notifications" className="notification-icon">
                    <FaBell />
                    {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                </Link>

                <Link to="/profile" className="user-profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                    <FaUserCircle className="user-avatar" />
                    <span className="user-name">{userName}</span>
                </Link>
            </div>
        </header>
    );
};

export default Navbar;
