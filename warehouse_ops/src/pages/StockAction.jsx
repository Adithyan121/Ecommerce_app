import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Scanner from '../components/Scanner';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBarcode, FaBox, FaHashtag, FaMapMarkerAlt, FaWarehouse, FaCheck } from 'react-icons/fa';

const StockAction = ({ type }) => {
    const navigate = useNavigate();
    const [showScanner, setShowScanner] = useState(false);

    // Form Data
    const [barcode, setBarcode] = useState('');
    const [quantity, setQuantity] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(''); // Location ID
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial Data Load
    useEffect(() => {
        api.get('/warehouse')
            .then(res => {
                setWarehouses(res.data);
                if (res.data.length > 0) setSelectedWarehouse(res.data[0]._id);
            })
            .catch(err => console.error('Failed to load warehouses'));
    }, []);

    // Load Locations when Warehouse changes
    useEffect(() => {
        if (selectedWarehouse) {
            api.get(`/warehouse/locations/${selectedWarehouse}`)
                .then(res => setLocations(res.data))
                .catch(err => console.error(err));
        } else {
            setLocations([]);
        }
    }, [selectedWarehouse]);

    const handleScan = (code) => {
        setBarcode(code);
        setShowScanner(false);
        toast.success(`Scanned: ${code}`);
        // Optional: Auto-fetch SKU details here to validate, but for speed we allow immediate flow
    };

    const handleSubmit = async () => {
        if (!barcode || !quantity || !selectedWarehouse) {
            toast.error('Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                barcode: barcode, // Backend handles lookup/creation
                warehouseId: selectedWarehouse,
                locationId: selectedLocation || undefined,
                quantity: Number(quantity),
                type: type === 'adjust' ? 'ADJUST' : type.toUpperCase(),
                reason: 'Manual App Entry'
            };

            const endpoint = `/warehouse/stock/${type}`;
            await api.post(endpoint, payload);

            toast.success('Success!', { icon: '✅' });

            // Reset crucial fields
            setBarcode('');
            setQuantity('');
            // Keep warehouse/location as user likely keeps scanning in same spot
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    // Render Scanner Overlay
    if (showScanner) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#000' }}>
                <Scanner onScan={handleScan} onClose={() => setShowScanner(false)} />
                <button
                    onClick={() => setShowScanner(false)}
                    className="btn"
                    style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', width: 'auto', background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                    Close Camera
                </button>
            </div>
        );
    }

    // Main UI
    return (
        <div className="container" style={{ paddingBottom: '100px' }}>
            {/* Header */}
            <div className="navbar" style={{ padding: '1rem 0', background: 'transparent' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: 0, background: 'transparent' }}>
                    <FaArrowLeft size={20} />
                </button>
                <h3>{type === 'in' ? 'Stock In' : type === 'out' ? 'Stock Out' : 'Adjust Stock'}</h3>
                <div style={{ width: 20 }}></div>
            </div>

            {/* Scanner Card */}
            <div
                className="card"
                onClick={() => setShowScanner(true)}
                style={{
                    background: 'var(--surface-color)',
                    height: '180px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.05)'
                }}
            >
                <div style={{
                    width: '60px', height: '60px',
                    background: 'rgba(187, 134, 252, 0.1)',
                    borderRadius: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1rem',
                    color: 'var(--primary-color)'
                }}>
                    <FaBarcode size={28} />
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>Tap to Scan Barcode</div>
                <div style={{ color: 'var(--text-medium-emphasis)', fontSize: '0.9rem', marginTop: '0.25rem' }}>or enter details below</div>
            </div>

            {/* Form Fields */}
            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* SKU Input */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-medium-emphasis)' }}>
                        <FaBox size={14} /> <span>SKU / Barcode</span>
                    </div>
                    <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Enter SKU or scan barcode"
                        className="input-field"
                        style={{ margin: 0, height: '56px' }}
                    />
                </div>

                {/* Warehouse Input */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-medium-emphasis)' }}>
                        <FaWarehouse size={14} /> <span>Warehouse</span>
                    </div>
                    <select
                        value={selectedWarehouse}
                        onChange={(e) => setSelectedWarehouse(e.target.value)}
                        className="input-field"
                        style={{ margin: 0, height: '56px' }}
                    >
                        {warehouses.map(w => (
                            <option key={w._id} value={w._id}>{w.name}</option>
                        ))}
                    </select>
                </div>

                {/* Location Input */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-medium-emphasis)' }}>
                        <FaMapMarkerAlt size={14} /> <span>Location</span>
                    </div>
                    <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="input-field"
                        style={{ margin: 0, height: '56px' }}
                        disabled={!selectedWarehouse}
                    >
                        <option value="">General Stock / None</option>
                        {locations.map(l => (
                            <option key={l._id} value={l._id}>{l.code} ({l.type})</option>
                        ))}
                    </select>
                </div>

                {/* Quantity Input */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-medium-emphasis)' }}>
                        <FaHashtag size={14} /> <span>Quantity</span>
                    </div>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity"
                        className="input-field"
                        style={{ margin: 0, height: '56px' }}
                    />
                </div>

            </div>

            {/* Action Button */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn"
                style={{
                    marginTop: '2rem',
                    background: type === 'out' ? '#CF6679' : 'var(--primary-color)',
                    color: type === 'out' ? '#000' : '#000',
                    height: '56px',
                    fontSize: '1rem',
                    position: 'sticky',
                    bottom: '80px', // above bottom nav
                    zIndex: 10
                }}
            >
                {loading ? 'Processing...' : (
                    <>
                        <FaCheck /> Confirm {type === 'in' ? 'Stock In' : type === 'out' ? 'Stock Out' : 'Adjustment'}
                    </>
                )}
            </button>
        </div>
    );
};

export default StockAction;
