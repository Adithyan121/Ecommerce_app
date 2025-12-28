import React, { useState, useEffect } from 'react';
import api from '../api';
import './Products.css'; // Reuse table styles

const WarehouseManagement = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [activeTab, setActiveTab] = useState('warehouses'); // warehouses, inventory
    const [newWh, setNewWh] = useState({ name: '', code: '', address: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWarehouses();
    }, []);

    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventory();
        }
    }, [activeTab]);

    const fetchWarehouses = async () => {
        try {
            const { data } = await api.get('/warehouse');
            setWarehouses(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/warehouse/inventory');
            setInventory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWarehouse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/warehouse', newWh);
            setNewWh({ name: '', code: '', address: '' });
            fetchWarehouses();
        } catch (error) {
            alert('Error creating warehouse');
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Warehouse & Inventory</h1>
                <div>
                    <button onClick={() => setActiveTab('warehouses')} className="btn" style={{ marginRight: 10, background: activeTab === 'warehouses' ? '#333' : '#fff', color: activeTab === 'warehouses' ? '#fff' : '#333' }}>Warehouses</button>
                    <button onClick={() => setActiveTab('inventory')} className="btn" style={{ background: activeTab === 'inventory' ? '#333' : '#fff', color: activeTab === 'inventory' ? '#fff' : '#333' }}>Inventory</button>
                </div>
            </div>

            {activeTab === 'warehouses' && (
                <div className="card">
                    <h3>Add Warehouse</h3>
                    <form onSubmit={handleCreateWarehouse} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                        <input placeholder="Name" value={newWh.name} onChange={e => setNewWh({ ...newWh, name: e.target.value })} required style={{ padding: 8 }} />
                        <input placeholder="Code" value={newWh.code} onChange={e => setNewWh({ ...newWh, code: e.target.value })} required style={{ padding: 8 }} />
                        <input placeholder="Address" value={newWh.address} onChange={e => setNewWh({ ...newWh, address: e.target.value })} style={{ padding: 8 }} />
                        <button type="submit" className="btn-primary">Add</button>
                    </form>

                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Address</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {warehouses.map(w => (
                                <tr key={w._id}>
                                    <td>{w.name}</td>
                                    <td>{w.code}</td>
                                    <td>{w.address}</td>
                                    <td>{w.isActive ? 'Active' : 'Inactive'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="card">
                    {loading ? <p>Loading...</p> : (
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Warehouse</th>
                                    <th>Location</th>
                                    <th>Quantity</th>
                                    <th>Reserved</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(i => (
                                    <tr key={i._id}>
                                        <td>{i.skuId?.sku || 'Unknown'}</td>
                                        <td>{i.warehouseId?.name}</td>
                                        <td>{i.locationId?.code || '-'}</td>
                                        <td>{i.quantity}</td>
                                        <td>{i.reserved}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default WarehouseManagement;
