import React, { useEffect, useState } from 'react';
import api from '../api';
import './Products.css';

const Inventory = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const { data } = await api.get('/inventory');
                setLogs(data);
            } catch (error) {
                console.error("Error fetching inventory logs", error);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="container">
            <div className="products-header">
                <h1>Inventory Logs</h1>
            </div>
            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Product</th>
                            <th>Action</th>
                            <th>Change</th>
                            <th>User</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td>{new Date(log.createdAt).toLocaleString()}</td>
                                <td>{log.product?.name || 'Unknown'}</td>
                                <td>
                                    <span className={`badge ${log.changeType === 'restock' ? 'success' : log.changeType === 'sale' ? 'info' : 'warning'}`}>
                                        {log.changeType}
                                    </span>
                                </td>
                                <td style={{ color: log.quantityChange > 0 ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {log.quantityChange > 0 ? '+' : ''}{log.quantityChange}
                                </td>
                                <td>{log.user?.name || 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Inventory;
