import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaBox, FaBarcode, FaMapMarkerAlt, FaHistory, FaExchangeAlt } from 'react-icons/fa';
import api from '../api';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        loadDetails();
    }, [id]);

    const loadDetails = async () => {
        try {
            // id is skuId
            const res = await api.get(`/warehouse/sku/${id}`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

    if (!data) return (
        <div className="container" style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>SKU not found.</p>
            <button className="btn btn-primary" onClick={() => navigate('/inventory')}>Back to Inventory</button>
        </div>
    );

    const { sku, inventory, stats, movements } = data;
    const product = sku.productId;

    return (
        <div className="container">
            <div className="navbar">
                <button onClick={() => navigate(-1)} className="btn" style={{ width: 'auto', padding: '0.5rem' }}><FaArrowLeft /></button>
                <h3>SKU Details</h3>
                <div style={{ width: 30 }}></div>
            </div>

            <div className="card" style={{ marginTop: '1rem', padding: 0, overflow: 'hidden' }}>
                {product?.image && (
                    <img
                        src={product.image}
                        alt={product.name}
                        style={{ width: '100%', height: '250px', objectFit: 'cover' }}
                    />
                )}
                <div style={{ padding: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{product?.name || 'Unknown Product'}</h2>

                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                        <div className="badge" style={{ background: 'var(--surface-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                            <FaBarcode /> <span>{sku.sku}</span>
                        </div>
                        {sku.barcode && (
                            <div className="badge" style={{ background: 'var(--surface-color)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                <FaBox /> <span>{sku.barcode}</span>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{stats.totalQuantity}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-medium-emphasis)' }}>Total</div>
                        </div>
                        <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>{stats.available}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-medium-emphasis)' }}>Available</div>
                        </div>
                        <div style={{ background: 'var(--surface-color)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--error-color)' }}>{stats.totalReserved}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-medium-emphasis)' }}>Reserved</div>
                        </div>
                    </div>

                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaMapMarkerAlt /> Locations</h4>
                    <div style={{ marginBottom: '2rem' }}>
                        {inventory.length === 0 ? <p style={{ color: 'var(--text-medium-emphasis)' }}>No stock in any location.</p> : (
                            inventory.map(inv => (
                                <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{inv.warehouseId?.name}</div>
                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-medium-emphasis)' }}>{inv.locationId?.code || 'General Stock'}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{inv.quantity}</div>
                                        {inv.reserved > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--error-color)' }}>{inv.reserved} Res.</div>}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaHistory /> Recent Movements</h4>
                    <div>
                        {movements.length === 0 ? <p style={{ color: 'var(--text-medium-emphasis)' }}>No recent movements.</p> : (
                            movements.map(mov => (
                                <div key={mov._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem0', borderBottom: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: mov.type === 'IN' ? 'rgba(76, 175, 80, 0.2)' : mov.type === 'OUT' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(33, 150, 243, 0.2)',
                                            color: mov.type === 'IN' ? 'var(--success-color)' : mov.type === 'OUT' ? 'var(--error-color)' : 'var(--primary-color)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <FaExchangeAlt />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{mov.type}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-medium-emphasis)' }}>
                                                {new Date(mov.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold', color: mov.quantity > 0 ? 'var(--success-color)' : 'var(--error-color)' }}>
                                            {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-medium-emphasis)' }}>
                                            {mov.warehouseId?.name}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
