import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaClipboardCheck, FaTimes } from 'react-icons/fa';
import { SOCKET_URL } from '../api';

// Initialize socket outside component
const socket = io(SOCKET_URL);

const OrderNotification = () => {
    const navigate = useNavigate();
    const [assignedOrder, setAssignedOrder] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            socket.emit('join_staff');
            socket.emit('join_room', user._id); // Join personal room for assignments
        }

        socket.on('new_assigned_order', (data) => {
            // Play Sound
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed'));

            setAssignedOrder(data);
        });

        return () => {
            socket.off('new_assigned_order');
        };
    }, []);

    const handlePick = () => {
        if (assignedOrder) {
            navigate(`/orders/outbound/${assignedOrder._id}`);
            setAssignedOrder(null);
        }
    };

    if (!assignedOrder) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1e1e1e',
                width: '90%',
                maxWidth: '400px',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--primary-color)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                textAlign: 'center',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <div style={{
                    width: 60, height: 60,
                    background: 'rgba(187, 134, 252, 0.2)',
                    color: 'var(--primary-color)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                }}>
                    <FaBoxOpen size={30} />
                </div>

                <h2 style={{ marginBottom: '0.5rem' }}>New Order Assigned!</h2>
                <p style={{ color: 'var(--text-medium-emphasis)', marginBottom: '1.5rem' }}>
                    You have been assigned a new order to pick.
                </p>

                <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-disabled)' }}>Order ID</span>
                        <span style={{ fontWeight: 'bold' }}>#{assignedOrder._id.substring(20)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-disabled)' }}>Items</span>
                        <span>{assignedOrder.itemsCount} items</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-disabled)' }}>Time</span>
                        <span>{new Date(assignedOrder.createdAt).toLocaleTimeString()}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setAssignedOrder(null)}
                        className="btn btn-secondary"
                        style={{ flex: 1 }}
                    >
                        Later
                    </button>
                    <button
                        onClick={handlePick}
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                    >
                        <FaClipboardCheck /> Pick Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderNotification;
