import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaTrash } from 'react-icons/fa';
import './Products.css';

const Coupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        const { data } = await api.get('/coupons');
        setCoupons(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/coupons', {
            code,
            type: 'percentage',
            value: Number(discount),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        });
        setCode('');
        setDiscount('');
        fetchCoupons();
    };

    const deleteCoupon = async (id) => {
        await api.delete(`/coupons/${id}`);
        fetchCoupons();
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Coupons & Discounts</h1>
            </div>
            <div className="dashboard-content">
                <div className="card">
                    <h3>Create Coupon</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Code</label>
                            <input type="text" value={code} onChange={e => setCode(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Discount (%)</label>
                            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} required />
                        </div>
                        <button className="btn">Create Coupon</button>
                    </form>
                </div>
                <div className="card">
                    <h3>Active Coupons</h3>
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Discount</th>
                                <th>Expiry</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(coupon => (
                                <tr key={coupon._id}>
                                    <td>{coupon.code}</td>
                                    <td>{coupon.value}%</td>
                                    <td>{new Date(coupon.expiryDate).toLocaleDateString()}</td>
                                    <td><button className="btn-icon delete" onClick={() => deleteCoupon(coupon._id)}><FaTrash /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Coupons;
