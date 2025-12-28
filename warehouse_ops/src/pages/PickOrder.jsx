import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBox, FaCheckCircle, FaMapMarkerAlt, FaBarcode, FaTimes } from 'react-icons/fa';
import Scanner from '../components/Scanner';

const PickOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);

    // Scan State
    const [scanningItem, setScanningItem] = useState(null); // The item currently being picked
    const [showScanner, setShowScanner] = useState(false);
    const [manualCode, setManualCode] = useState('');

    useEffect(() => {
        fetchOrder();
        fetchWarehouses();
    }, [id]);

    const fetchWarehouses = async () => {
        try {
            const res = await api.get('/warehouse');
            setWarehouses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchOrder = async () => {
        try {
            const res = await api.get(`/warehouse/outbound/orders/${id}`);
            setOrder(res.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load Order');
            navigate('/orders');
        }
    };

    const initiatePick = (item, location) => {
        setScanningItem({ ...item, targetLocation: location });
        setShowScanner(true);
        setManualCode('');
    };

    const handleScanCheck = (code) => {
        // Filter out browser error artifacts
        if (!code || code.toLowerCase().includes('runtime.lasterror')) return;

        // Normalize
        const scanned = code.trim().toLowerCase();

        // Robust SKU finding:
        // 1. item.sku (if saved on order)
        // 2. item.product?.sku (populated from Product)
        let targetSku = (scanningItem.sku || '').trim().toLowerCase();
        let targetBarcode = (scanningItem.barcode || '').trim().toLowerCase();

        if (scanningItem.product) {
            if (!targetSku && scanningItem.product.sku) {
                targetSku = scanningItem.product.sku.trim().toLowerCase();
            }
            if (!targetBarcode && scanningItem.product.barcode) {
                targetBarcode = scanningItem.product.barcode.trim().toLowerCase();
            }
        }

        console.log('Verifying Scan:', { scanned, targetSku, targetBarcode, item: scanningItem });

        let valid = false;

        // Check 1: Exact SKU Match
        if (targetSku && scanned === targetSku) valid = true;

        // Check 2: Barcode Match
        if (targetBarcode && scanned === targetBarcode) valid = true;

        // Check 2: Simple partial match if backend data is messy (e.g. SKU has extra chars)
        // if (targetSku && (targetSku.includes(scanned) || scanned.includes(targetSku))) valid = true;

        // Debugging Bypass (remove in production) - if scanned code is just "1" or "ok"
        // if (scanned === '1') valid = true;    
        if (valid) {
            setShowScanner(false);
            setScanningItem(null);
            toast.success('Product Verified!', { icon: '✅' });
            confirmPick(scanningItem, scanningItem.targetLocation, scanningItem.qty);
        } else {
            console.warn(`Mismatch. Scanned: "${scanned}", Expected: SKU "${targetSku}" or Barcode "${targetBarcode}"`);
            toast.error(`Mismatch! Scanned: ${code}`, { id: 'mismatch-error' });
        }
    };

    const confirmPick = async (item, location, qty) => {
        if (warehouses.length === 0) {
            toast.error('No warehouses found');
            return;
        }
        const defaultWarehouseId = warehouses[0]._id;

        try {
            await api.post('/warehouse/stock/out', {
                skuId: item.skuId,
                warehouseId: defaultWarehouseId,
                locationId: location ? location.locationId : undefined,
                quantity: qty,
                reason: `Order Pick #${order._id}`,
                referenceId: order._id
            });

            toast.success('Picked Successfully');
            fetchOrder();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Pick Failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="navbar" style={{ marginBottom: '1rem', background: 'transparent' }}>
                <button onClick={() => navigate('/orders')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}>
                    <FaArrowLeft />
                </button>
                <h3>Pick Order</h3>
                <div style={{ width: 30 }}></div>
            </div>

            <div className="card" style={{ marginBottom: '1rem', borderLeft: '4px solid var(--primary-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Order #{order._id.substring(20)}</h4>
                    <span className="badge" style={{ background: 'var(--surface-hover)' }}>{order.pickStatus || 'Pending'}</span>
                </div>
                <p style={{ marginTop: '0.5rem', color: '#aaa' }}>{order.orderItems.length} Items to pick</p>
            </div>

            {/* List Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {order.orderItems.map((item, idx) => {
                    const bestLoc = item.availableLocations && item.availableLocations.length > 0 ? item.availableLocations[0] : null;

                    // If already picked (based on status or logic?), for now we don't have item-level status in this view object
                    // We can assume if we can't find stock or if order is 'Packed'

                    return (
                        <div key={idx} className="card">
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                {item.image && <img src={item.image} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />}
                                <div style={{ flex: 1 }}>
                                    <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                        <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Qty: {item.qty}</span>
                                        <span style={{ fontSize: '0.8rem', color: '#aaa', fontFamily: 'monospace' }}>{item.sku}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaMapMarkerAlt color="var(--secondary-color)" />
                                <span style={{ color: '#fff' }}>
                                    {bestLoc ? `${bestLoc.code} (Avail: ${bestLoc.qty})` : 'No Stock Found'}
                                </span>
                            </div>

                            <button
                                className="btn btn-primary"
                                disabled={!bestLoc}
                                onClick={() => initiatePick(item, bestLoc)}
                                style={{ width: '100%', borderRadius: '8px', padding: '0.8rem' }}
                            >
                                <FaBarcode style={{ marginRight: 8 }} /> Scan & Pick
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Scanner / Input Overlay */}
            {showScanner && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#1e1e1e', display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2d2d2d' }}>
                        <h4 style={{ margin: 0 }}>Verify Item</h4>
                        <button onClick={() => setShowScanner(false)} className="btn" style={{ width: 'auto', background: 'transparent', padding: 0 }}>
                            <FaTimes size={24} />
                        </button>
                    </div>

                    {/* Camera Section - Flexible but limited */}
                    <div style={{ flex: '1', minHeight: '30vh', position: 'relative', overflow: 'hidden', background: '#000' }}>
                        <Scanner onScan={handleScanCheck} onClose={() => { }} />
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            border: '2px solid var(--primary-color)', width: '200px', height: '200px', borderRadius: '12px',
                            boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)', pointerEvents: 'none'
                        }}></div>
                        <p style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center', color: '#fff', textShadow: '0 1px 2px #000', margin: 0 }}>
                            Scan <strong>{scanningItem?.sku}</strong>
                        </p>
                    </div>

                    {/* Manual Input Section - Fixed Height & Safe Area */}
                    <div style={{ padding: '1rem', background: '#1e1e1e', borderTop: '1px solid #333', paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
                            <span style={{ color: '#888', fontSize: '0.8rem' }}>OR TYPE CODE</span>
                            <div style={{ height: '1px', flex: 1, background: '#444' }}></div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                className="input-field"
                                style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '1px', padding: '0.75rem' }}
                                placeholder="Enter Barcode / SKU"
                                value={manualCode}
                                onChange={e => setManualCode(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleScanCheck(manualCode);
                                }}
                            />
                            <button
                                className="btn btn-primary"
                                style={{ width: 'auto', padding: '0 1.25rem' }}
                                onClick={() => handleScanCheck(manualCode)}
                            >
                                <FaCheckCircle size={20} />
                            </button>
                        </div>
                        {/* Extra space for keyboard on some browsers */}
                        <div style={{ height: '10px' }}></div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PickOrder;
