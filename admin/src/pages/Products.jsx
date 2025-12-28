import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import './Products.css';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchCategories();
        // Initial fetch handled by debounce effect
    }, []);

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchTerm, selectedCategory);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async (keyword = '', category = '') => {
        try {
            let url = `/products?keyword=${keyword}`;
            if (category) url += `&category=${encodeURIComponent(category)}`;
            const { data } = await api.get(url);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Search triggered by effect
    };

    const handleCategoryChange = (e) => {
        const cat = e.target.value;
        setSelectedCategory(cat);
        // Effect will trigger fetch
    };

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product", error);
            }
        }
    };

    const handleImport = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post('/products/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Products imported successfully!');
            fetchProducts();
        } catch (error) {
            console.error("Error importing products", error);
            alert('Error importing products');
        } finally {
            e.target.value = null; // Reset input
        }
    };

    return (
        <div className="products-page container">
            <div className="products-header">
                <h1>Products</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                        </select>
                        <input
                            type="text"
                            placeholder="Search Name, SKU, or Tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <input
                        type="file"
                        id="csvUpload"
                        accept=".csv"
                        style={{ display: 'none' }}
                        onChange={handleImport}
                    />
                    <button
                        className="btn btn-secondary"
                        onClick={() => document.getElementById('csvUpload').click()}
                    >
                        Import CSV
                    </button>
                    <Link to="/add-product" className="btn">Add Product</Link>
                </div>
            </div>
            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <img
                                        src={product.images?.[0] || product.image || 'https://via.placeholder.com/50'}
                                        alt={product.name}
                                        className="product-thumb"
                                    />
                                </td>
                                <td>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-sku">SKU: {product.sku || 'N/A'}</div>
                                </td>
                                <td>{product.category}</td>
                                <td>₹{product.price}</td>
                                <td>
                                    <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge ${product.visibility === 'published' ? 'active' : 'inactive'}`}>
                                        {product.visibility === 'published' ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <div className="actions">
                                        <Link to={`/product/${product._id}/edit`} className="btn-icon edit"><FaEdit /></Link>
                                        <button className="btn-icon delete" onClick={() => deleteHandler(product._id)}><FaTrash /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Products;
