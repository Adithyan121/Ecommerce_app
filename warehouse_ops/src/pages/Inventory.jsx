import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Inventory = () => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [lowStock, setLowStock] = useState(false);
    const [reserved, setReserved] = useState(false);

    useEffect(() => {
        loadWarehouses();
    }, []);

    useEffect(() => {
        if (selectedWarehouse) {
            loadLocations(selectedWarehouse);
        } else {
            setLocations([]);
            setSelectedLocation('');
        }
    }, [selectedWarehouse]);

    useEffect(() => {
        // Debounce search or load on filter change
        const timeoutId = setTimeout(() => {
            loadInventory();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedWarehouse, selectedLocation, lowStock, reserved]);

    const loadWarehouses = async () => {
        try {
            const { data } = await api.get('/warehouse');
            setWarehouses(data);
        } catch (error) {
            console.error('Failed to load warehouses', error);
        }
    };

    const loadLocations = async (whId) => {
        try {
            const { data } = await api.get(`/warehouse/locations/${whId}`);
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations', error);
        }
    };

    const loadInventory = async () => {
        setLoading(true);
        try {
            const params = {
                search: searchTerm,
                warehouseId: selectedWarehouse,
                locationId: selectedLocation,
                lowStock: lowStock,
                reserved: reserved
            };
            const { data } = await api.get('/warehouse/inventory', { params });
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}><FaArrowLeft /></button>
                <h3>Inventory</h3>
                <div style={{ width: 30 }}></div>
            </div>

            <div style={{ marginBottom: '1rem', position: 'sticky', top: 0, zIndex: 10, background: 'var(--background-color)', padding: '1rem 0' }}>
                <div className="card" style={{ padding: '0.5rem' }}>
                    <div className="input-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: showFilters ? '1rem' : 0 }}>
                        <FaSearch color="var(--text-medium-emphasis)" />
                        <input
                            type="text"
                            placeholder="Scan Barcode or Search SKU/Name..."
                            style={{ border: 'none', outline: 'none', background: 'transparent', color: 'inherit', width: '100%', padding: '0.5rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button
                            className="btn"
                            style={{ width: 'auto', padding: '0.5rem', fontSize: '0.8rem', background: showFilters ? 'var(--primary-color)' : 'var(--surface-color)' }}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            Filters
                        </button>
                    </div>

                    {showFilters && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                <select
                                    value={selectedWarehouse}
                                    onChange={(e) => setSelectedWarehouse(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="">All Warehouses</option>
                                    {warehouses.map(wh => (
                                        <option key={wh._id} value={wh._id}>{wh.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="input-field"
                                    disabled={!selectedWarehouse}
                                >
                                    <option value="">All Locations</option>
                                    {locations.map(loc => (
                                        <option key={loc._id} value={loc._id}>{loc.code}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={lowStock}
                                        onChange={(e) => setLowStock(e.target.checked)}
                                    />
                                    <span>Low Stock</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={reserved}
                                        onChange={(e) => setReserved(e.target.checked)}
                                    />
                                    <span>Reserved</span>
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div> : (
                <div style={{ paddingBottom: '80px' }}>
                    {items.map(item => {
                        const product = item.skuId?.productId;
                        return (
                            <div
                                key={item._id}
                                className="card"
                                style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: 'pointer' }}
                                onClick={() => navigate(`/inventory/sku/${item.skuId?._id}`)}
                            >
                                {product?.image && (
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, background: '#333' }}
                                    />
                                )}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                                            {product?.name || item.skuId?.sku || 'Unknown Product'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-medium-emphasis)' }}>
                                        <span>SKU: {item.skuId?.sku}</span>
                                        <span style={{ color: item.quantity < (item.skuId?.minimumStockLevel || 0) ? 'var(--error-color)' : 'var(--primary-color)', fontWeight: 'bold' }}>
                                            {item.quantity} units
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-medium-emphasis)', marginTop: '0.25rem' }}>
                                        {item.warehouseId?.name}
                                        {item.locationId ? ` - ${item.locationId.code}` : ''}
                                    </div>
                                    {item.reserved > 0 && (
                                        <div style={{ fontSize: '0.8rem', color: 'var(--warning-color)', marginTop: '0.25rem' }}>
                                            Reserved: {item.reserved}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && <p style={{ textAlign: 'center', marginTop: '2rem' }}>No inventory found.</p>}
                </div>
            )}
        </div>
    );
};

export default Inventory;
