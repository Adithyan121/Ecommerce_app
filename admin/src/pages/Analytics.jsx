import React, { useEffect, useState } from 'react';
import api from '../api';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import './Dashboard.css'; // Reuse dashboard styles

const Analytics = () => {
    const [stats, setStats] = useState({
        sales: 0,
        orders: 0,
        products: 0,
        customers: 0
    });

    // Mock Data for Charts
    const salesData = [
        { name: 'Jan', revenue: 4000, orders: 24 },
        { name: 'Feb', revenue: 3000, orders: 18 },
        { name: 'Mar', revenue: 2000, orders: 12 },
        { name: 'Apr', revenue: 2780, orders: 20 },
        { name: 'May', revenue: 1890, orders: 15 },
        { name: 'Jun', revenue: 2390, orders: 22 },
        { name: 'Jul', revenue: 3490, orders: 30 },
        { name: 'Aug', revenue: 4200, orders: 35 },
        { name: 'Sep', revenue: 5100, orders: 40 },
        { name: 'Oct', revenue: 4800, orders: 38 },
        { name: 'Nov', revenue: 6000, orders: 50 },
        { name: 'Dec', revenue: 7000, orders: 60 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 400 },
        { name: 'Fashion', value: 300 },
        { name: 'Home', value: 300 },
        { name: 'Beauty', value: 200 },
    ];

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/analytics/dashboard');
                setStats(data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="container" style={{ paddingBottom: '2rem' }}>
            <div className="products-header">
                <h1>Reports & Analytics</h1>
            </div>

            {/* Key Metrics */}
            <div className="stats-grid">
                <div className="card stat-card blue">
                    <h3>Total Revenue</h3>
                    <p>₹{stats.sales.toLocaleString()}</p>
                </div>
                <div className="card stat-card purple">
                    <h3>Total Orders</h3>
                    <p>{stats.orders}</p>
                </div>
                <div className="card stat-card green">
                    <h3>Products</h3>
                    <p>{stats.products}</p>
                </div>
                <div className="card stat-card orange">
                    <h3>Customers</h3>
                    <p>{stats.customers}</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="dashboard-content" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>

                {/* Sales Report (Line Chart) */}
                <div className="card" style={{ gridColumn: '1 / -1' }}>
                    <h3>Sales Report (Yearly)</h3>
                    <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="var(--text-color)" />
                                <YAxis stroke="var(--text-color)" />
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue (₹)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Overview (Bar Chart) */}
                <div className="card">
                    <h3>Orders Overview</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                <XAxis dataKey="name" stroke="var(--text-color)" />
                                <YAxis stroke="var(--text-color)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                                />
                                <Legend />
                                <Bar dataKey="orders" fill="#82ca9d" name="Orders" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution (Pie Chart) */}
                <div className="card">
                    <h3>Sales by Category</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--text-color)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Analytics;
