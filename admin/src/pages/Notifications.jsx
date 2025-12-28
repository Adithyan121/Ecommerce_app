import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTrash } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setLoading(false);

        } catch (error) {
            console.error("Error fetching notifications", error.response || error);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchNotifications();
        // Optional: Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`, {});
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Error marking as read", error);
        }
    };

    const deleteNotification = async (id) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.delete(`/notifications/${id}`);
                setNotifications(notifications.filter(n => n._id !== id));
            } catch (error) {
                console.error("Error deleting notification", error);
            }
        }
    };

    const clearAll = async () => {
        if (window.confirm('Are you sure you want to clear ALL notifications? This cannot be undone.')) {
            try {
                await api.delete('/notifications');
                setNotifications([]);
            } catch (error) {
                console.error("Error clearing notifications", error);
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <FaBell className="icon-blue" />;
            case 'success': return <FaCheckCircle className="icon-green" />;
            case 'alert': return <FaExclamationCircle className="icon-red" />;
            case 'info': return <FaInfoCircle className="icon-gray" />;
            default: return <FaBell />;
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        return `${Math.floor(diff / 86400)} days ago`;
    };

    return (
        <div className="notifications-container">
            <div className="page-header">
                <div className="header-left">
                    <h1>Notifications</h1>
                </div>
                <div className="header-actions">
                    {notifications.length > 0 && (
                        <button className="btn-secondary" onClick={clearAll}>Clear All</button>
                    )}
                </div>
            </div>

            <div className="notifications-list">
                {loading ? (
                    <div className="no-notifications">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="no-notifications">
                        <FaBell size={40} style={{ opacity: 0.2 }} />
                        <p>No new notifications</p>
                    </div>
                ) : (
                    notifications.map(notification => (
                        <div key={notification._id} className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}>
                            <div className="notification-icon">
                                {getIcon(notification.type)}
                            </div>
                            <div className="notification-content">
                                {notification.link ? (
                                    <Link to={notification.link} className="message-link" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <p className="message" style={{ cursor: 'pointer', fontWeight: '500' }}>{notification.message}</p>
                                    </Link>
                                ) : (
                                    <p className="message">{notification.message}</p>
                                )}
                                <span className="time">{formatTime(notification.createdAt)}</span>
                            </div>
                            <div className="notification-actions">
                                {!notification.isRead && (
                                    <button className="btn-icon" onClick={() => markAsRead(notification._id)} title="Mark as read">
                                        <FaCheckCircle />
                                    </button>
                                )}
                                <button className="btn-icon delete" onClick={() => deleteNotification(notification._id)} title="Delete">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
