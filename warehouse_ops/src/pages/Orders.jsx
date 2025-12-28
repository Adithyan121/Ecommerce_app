import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBox, FaTruck, FaShoppingCart, FaSearch, FaClipboardCheck } from 'react-icons/fa';

const Orders = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('outbound'); // 'inbound' or 'outbound'

    // Data
    const [inboundOrders, setInboundOrders] = useState([]);
    const [outboundOrders, setOutboundOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'inbound') {
                const res = await api.get('/warehouse/inbound/po');
                setInboundOrders(res.data);
            } else {
                const res = await api.get('/warehouse/outbound/orders');
                setOutboundOrders(res.data);
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            // toast.error('Failed to load orders');
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }) => {
        let color = '#777';
        if (status === 'Pending' || status === 'Created') color = '#ffb74d';
        if (status === 'Partially Received' || status === 'In Progress') color = '#4fc3f7';
        if (status === 'Received' || status === 'Shipped' || status === 'Picked') color = '#81c784';

        return (
            <span style={{ fontSize: '0.75rem', background: color, color: '#121212', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                {status}
            </span>
        );
    };

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div className="navbar" style={{ marginBottom: '1rem', background: 'transparent' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}>
                    <FaArrowLeft />
                </button>
                <h3>Orders</h3>
                <div style={{ width: 30 }}></div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button
                    className="btn"
                    style={{
                        flex: 1,
                        background: activeTab === 'inbound' ? 'var(--primary-color)' : '#333',
                        color: activeTab === 'inbound' ? '#121212' : '#fff'
                    }}
                    onClick={() => setActiveTab('inbound')}
                >
                    <FaTruck style={{ marginRight: '0.5rem' }} /> Inbound (PO)
                </button>
                <button
                    className="btn"
                    style={{
                        flex: 1,
                        background: activeTab === 'outbound' ? 'var(--primary-color)' : '#333',
                        color: activeTab === 'outbound' ? '#121212' : '#fff'
                    }}
                    onClick={() => setActiveTab('outbound')}
                >
                    <FaShoppingCart style={{ marginRight: '0.5rem' }} /> Outbound
                </button>
            </div>

            {/* List */}
            {loading ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {activeTab === 'inbound' ? (
                        inboundOrders.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>No active POs</p> :
                            inboundOrders.map(po => (
                                <div key={po._id} className="card" onClick={() => navigate(`/orders/inbound/${po._id}`)} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{po.poNumber}</span>
                                        <StatusBadge status={po.status} />
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                        <p>Supplier: {po.supplier}</p>
                                        <p>Items: {po.items.length}</p>
                                    </div>
                                </div>
                            ))
                    ) : (
                        outboundOrders.length === 0 ? <p style={{ textAlign: 'center', color: '#888' }}>No orders ready to pick</p> :
                            outboundOrders.map(order => (
                                <div key={order._id} className="card" onClick={() => navigate(`/orders/outbound/${order._id}`)} style={{ cursor: 'pointer' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Order #{order._id.substring(20)}</span>
                                        <StatusBadge status={order.pickStatus || 'Pending'} />
                                    </div>
                                    <div style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                        <p>Customer: {order.user?.name || 'Unknown'}</p>
                                        <p>Total: ${order.totalPrice}</p>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            )}
        </div>
    );
};

export default Orders;
