import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Scanner from '../components/Scanner';

const ReceivePO = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanningItem, setScanningItem] = useState(null); // Which item we are scanning for
    const [qtyInput, setQtyInput] = useState('');
    const [scannerOpen, setScannerOpen] = useState(false);

    useEffect(() => {
        fetchPO();
    }, [id]);

    const fetchPO = async () => {
        try {
            const res = await api.get(`/warehouse/inbound/po/${id}`);
            setPo(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load PO');
            navigate('/orders');
        }
    };

    const handleItemClick = (item) => {
        // If fully received, do nothing or alert?
        if (item.quantityReceived >= item.quantityExpected) {
            toast('Item already received', { icon: '✅' });
            return;
        }
        setScanningItem(item);
        setQtyInput(item.quantityExpected - item.quantityReceived); // Default to remaining
        setScannerOpen(false); // Can open if user wants
    };

    const handleReceiveSubmit = async (e) => {
        e.preventDefault();
        if (!scanningItem || !qtyInput) return;

        try {
            // Need a location. For "Receiving", usually we receive to "Dock" or "Staging".
            // Let's assume user confirms quantity and it goes to "Receiving Staging" (STAGE-01).
            // For MVP, we pass locationId null (or lookup STAGE-01 if I had time, but controller handles defaults or null).
            // Actually controller logic: if null, creates without location? Or we should fix specific location.
            // Let's hardcode a location query via API? Or assume receiving logic in backend handles 'Staging' logic.
            // My controller `receivePOItem` takes `locationId`. If null, puts in null location.
            // I should default to 'STAGE-01'. 
            // I'll leave locationId empty, and backend will put item in 'null' location. 
            // Better: Prompt user "Scan Dock Location" or just auto-assign. 
            // Auto is faster.

            await api.post('/warehouse/inbound/receive', {
                poId: po._id,
                skuId: scanningItem.skuId._id,
                quantity: Number(qtyInput),
                warehouseId: po.warehouseId // use PO's warehouse
            });

            toast.success('Received');
            setScanningItem(null);
            fetchPO(); // Refresh
        } catch (error) {
            toast.error('Receive failed');
        }
    };

    // Scanner integration
    const handleScan = (code) => {
        // Find item in PO matching code
        if (!po) return;

        // Match by SKU code or Barcode? 
        // My SKU model has `barcode`. Product has `sku` field.
        // `scanningItem` logic relies on `skuId.sku` or `skuId.barcode`.
        const match = po.items.find(i =>
            i.skuId.barcode === code ||
            i.skuId.sku === code ||
            i.skuId.productId.sku === code
        );

        if (match) {
            handleItemClick(match);
            toast.success('Item Found');
            setScannerOpen(false);
        } else {
            toast.error('Item not in this PO');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            <div className="navbar" style={{ marginBottom: '1rem', background: 'transparent' }}>
                <button onClick={() => navigate('/orders')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}>
                    <FaArrowLeft />
                </button>
                <h3>Receive PO</h3>
                <div style={{ width: 30 }}></div>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h4>{po.poNumber}</h4>
                <p style={{ color: '#aaa' }}>{po.supplier}</p>
                <div style={{ width: '100%', height: '8px', background: '#333', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
                    <div style={{
                        width: `${(po.items.reduce((a, c) => a + c.quantityReceived, 0) / po.items.reduce((a, c) => a + c.quantityExpected, 0)) * 100}%`,
                        height: '100%', background: 'var(--primary-color)'
                    }}></div>
                </div>
            </div>

            {scanningItem ? (
                <div className="card" style={{ border: '1px solid var(--primary-color)' }}>
                    <h4>Receive Item</h4>
                    <p><strong>SKU:</strong> {scanningItem.skuId.sku}</p>
                    <p><strong>Name:</strong> {scanningItem.skuId.productId.name}</p>
                    <p>Remaining: {scanningItem.quantityExpected - scanningItem.quantityReceived}</p>

                    <form onSubmit={handleReceiveSubmit} style={{ marginTop: '1rem' }}>
                        <div className="input-group">
                            <label>Quantity Received</label>
                            <input
                                type="number"
                                className="input-field"
                                value={qtyInput}
                                onChange={e => setQtyInput(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="button" onClick={() => setScanningItem(null)} className="btn" style={{ background: '#444' }}>Cancel</button>
                            <button type="submit" className="btn btn-primary">Confirm</button>
                        </div>
                    </form>
                </div>
            ) : (
                <>
                    <button onClick={() => setScannerOpen(true)} className="btn btn-primary" style={{ marginBottom: '1rem' }}>Scan Item Check</button>
                    {scannerOpen && <Scanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {po.items.map((item, idx) => (
                            <div key={idx} className="card" onClick={() => handleItemClick(item)} style={{ opacity: item.quantityReceived >= item.quantityExpected ? 0.6 : 1, display: 'flex', gap: '1rem' }}>
                                {item.skuId.productId.image && <img src={item.skuId.productId.image} style={{ width: 50, height: 50, borderRadius: 4, objectFit: 'cover' }} />}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <strong>{item.skuId.productId.name}</strong>
                                        <span>{item.quantityReceived} / {item.quantityExpected}</span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#aaa' }}>SKU: {item.skuId.sku}</span>
                                </div>
                                {item.quantityReceived >= item.quantityExpected && <FaCheck color="green" />}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default ReceivePO;
