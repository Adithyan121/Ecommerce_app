import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaTrash } from 'react-icons/fa';
import './Products.css';
import './Form.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [parent, setParent] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', {
                name,
                parent: parent || null
            });
            setName('');
            setParent('');
            fetchCategories();
        } catch (error) {
            console.error("Error creating category", error);
        }
    };

    const deleteCategory = async (id) => {
        if (window.confirm('Delete this category?')) {
            try {
                await api.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error("Error deleting category", error);
            }
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Categories</h1>
            </div>

            <div className="dashboard-content">
                <div className="card">
                    <h3>Add Category</h3>
                    <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
                        <div className="form-group">
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Parent Category (Optional)</label>
                            <select value={parent} onChange={(e) => setParent(e.target.value)}>
                                <option value="">None</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn">Add Category</button>
                    </form>
                </div>

                <div className="card">
                    <h3>All Categories</h3>
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Slug</th>
                                <th>Parent</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map((cat) => (
                                <tr key={cat._id}>
                                    <td>{cat.name}</td>
                                    <td>{cat.slug}</td>
                                    <td>{cat.parent ? cat.parent.name : '-'}</td>
                                    <td>
                                        <button className="btn-icon delete" onClick={() => deleteCategory(cat._id)}><FaTrash /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Categories;
