import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaTrash } from 'react-icons/fa';
import './Products.css';

const Shipping = () => {
    const [zones, setZones] = useState([]);
    const [name, setName] = useState('');
    const [regions, setRegions] = useState('');

    useEffect(() => {
        fetchZones();
    }, []);

    const fetchZones = async () => {
        const { data } = await api.get('/shipping');
        setZones(data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await api.post('/shipping', {
            name,
            regions: regions.split(',').map(r => r.trim())
        });
        setName('');
        setRegions('');
        fetchZones();
    };

    const deleteZone = async (id) => {
        await api.delete(`/shipping/${id}`);
        fetchZones();
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Shipping Management</h1>
            </div>
            <div className="dashboard-content">
                <div className="card">
                    <h3>Add Shipping Zone</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Zone Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Regions (comma separated)</label>
                            <input type="text" value={regions} onChange={e => setRegions(e.target.value)} placeholder="US, CA, UK" />
                        </div>
                        <button className="btn">Add Zone</button>
                    </form>
                </div>
                <div className="card">
                    <h3>Zones</h3>
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Regions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {zones.map(zone => (
                                <tr key={zone._id}>
                                    <td>{zone.name}</td>
                                    <td>{zone.regions.join(', ')}</td>
                                    <td><button className="btn-icon delete" onClick={() => deleteZone(zone._id)}><FaTrash /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Shipping;
