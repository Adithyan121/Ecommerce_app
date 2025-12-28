import React, { useEffect, useState } from 'react';
import api from '../api';
import './Dashboard.css';
import {
    FaShoppingCart,
    FaBoxOpen,
    FaUsers,
    FaMoneyBillWave,
    FaExclamationTriangle,
    FaChartLine
} from 'react-icons/fa';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/dashboard/overview');
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div className="dashboard-loading">Loading Dashboard...</div>;
    if (error) return <div className="dashboard-error">{error}</div>;
    if (!data) return null;

    const { stats, salesData, topProducts, lowStockProducts, recentActivity } = data;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome back, here's what's happening successfully.</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon"><FaMoneyBillWave /></div>
                    <div className="stat-info">
                        <h3>Total Revenue</h3>
                        <p>₹{stats.revenue?.toLocaleString() || 0}</p>
                    </div>
                </div>
                <div className="stat-card orders">
                    <div className="stat-icon"><FaShoppingCart /></div>
                    <div className="stat-info">
                        <h3>Total Orders</h3>
                        <p>{stats.orders || 0}</p>
                    </div>
                </div>
                <div className="stat-card products">
                    <div className="stat-icon"><FaBoxOpen /></div>
                    <div className="stat-info">
                        <h3>Products</h3>
                        <p>{stats.products || 0}</p>
                    </div>
                </div>
                <div className="stat-card users">
                    <div className="stat-icon"><FaUsers /></div>
                    <div className="stat-info">
                        <h3>Customers</h3>
                        <p>{stats.users || 0}</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                <div className="chart-container main-chart">
                    <h2>Sales Overview</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesData?.daily || []}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                                <XAxis dataKey="_id" stroke="#666" fontSize={12} tickFormatter={(str) => str.slice(5)} />
                                <YAxis stroke="#666" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#8884d8" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="dashboard-lower-section">
                {/* Top Products */}
                <div className="dashboard-card top-products">
                    <div className="card-header">
                        <h3>Top Selling Products</h3>
                        <FaChartLine className="card-icon" />
                    </div>
                    <div className="list-content">
                        {topProducts?.length > 0 ? (
                            topProducts.map((product) => (
                                <div key={product._id} className="list-item">
                                    <span className="item-name">{product.name}</span>
                                    <span className="item-value">{product.sold} sold</span>
                                    <span className="item-revenue">₹{product.revenue.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No sales data yet.</p>
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="dashboard-card low-stock">
                    <div className="card-header">
                        <h3>Low Stock Alerts</h3>
                        <FaExclamationTriangle className="card-icon warning" />
                    </div>
                    <div className="list-content">
                        {lowStockProducts?.length > 0 ? (
                            lowStockProducts.map((product) => (
                                <div key={product._id} className="list-item">
                                    <div className="item-meta">
                                        <img src={product.image} alt={product.name} className="item-thumb" />
                                        <span className="item-name">{product.name}</span>
                                    </div>
                                    <span className="stock-badge warning">Only {product.stock} left</span>
                                </div>
                            ))
                        ) : (
                            <div className="success-msg">Inventory looks good!</div>
                        )}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="dashboard-card recent-activity">
                    <div className="card-header">
                        <h3>Recent Activity</h3>
                        <FaBoxOpen className="card-icon" />
                    </div>
                    <div className="list-content">
                        {recentActivity?.length > 0 ? (
                            recentActivity.map((log) => (
                                <div key={log._id} className="list-item activity">
                                    <span className="activity-action">{log.action || 'Action'}</span>
                                    <span className="activity-user">{log.user?.name || 'System'}</span>
                                    <span className="activity-time">{new Date(log.createdAt).toLocaleDateString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="empty-msg">No recent activity.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
