import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import './Banners.css';
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from 'react-icons/fa';

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: 'New Collection',
        subtitle: 'Summer Sale',
        description: 'Get 50% off on all items.',
        image: '',
        link: '/shop',
        btnText: 'Shop Now',

        // Colors
        bgGradientStart: '#8FD3F4',
        bgGradientEnd: '#a2d9ff',
        titleColor: '#ffffff',
        subtitleColor: '#5d67a6',
        descColor: '#ffffff',

        // Button
        btnBgColor: '#7b8de6',
        btnTextColor: '#ffffff',
        btnRadius: 30,

        position: 'home-slider',
        isActive: true,
        order: 0,
        showThumbnails: true,
        thumbnails: [
            { image: '', title: 'Placeholder', price: '0' },
            { image: '', title: 'Placeholder', price: '0' },
            { image: '', title: 'Placeholder', price: '0' }
        ]
    });
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            const { data } = await api.get('/banners/admin');
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners", error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleThumbnailChange = (index, field, value) => {
        const newThumbnails = [...formData.thumbnails];
        newThumbnails[index] = { ...newThumbnails[index], [field]: value };
        setFormData(prev => ({ ...prev, thumbnails: newThumbnails }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/banners/${editId}`, formData);
            } else {
                await api.post('/banners', formData);
            }
            setShowForm(false);
            setEditId(null);
            fetchBanners();
            toast.success(editId ? "Banner updated successfully!" : "Banner created successfully!");
        } catch (error) {
            console.error("Error saving banner", error);
            toast.error(error.response?.data?.message || "Error saving banner");
        }
    };

    const handleEdit = (banner) => {
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            description: banner.description || '',
            image: banner.image,
            link: banner.link || '/shop',
            btnText: banner.btnText || 'Shop Now',

            bgGradientStart: banner.bgGradientStart || '#8FD3F4',
            bgGradientEnd: banner.bgGradientEnd || '#a2d9ff',
            titleColor: banner.titleColor || '#ffffff',
            subtitleColor: banner.subtitleColor || '#5d67a6',
            descColor: banner.descColor || '#ffffff',

            btnBgColor: banner.btnBgColor || '#7b8de6',
            btnTextColor: banner.btnTextColor || '#ffffff',
            btnRadius: banner.btnRadius || 30,

            position: banner.position,
            isActive: banner.isActive,
            order: banner.order || 0,
            showThumbnails: banner.showThumbnails !== undefined ? banner.showThumbnails : true,
            thumbnails: (banner.thumbnails && banner.thumbnails.length === 3) ? banner.thumbnails : [
                { image: '', title: 'Placeholder', price: '0' },
                { image: '', title: 'Placeholder', price: '0' },
                { image: '', title: 'Placeholder', price: '0' }
            ]
        });
        setEditId(banner._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                await api.delete(`/banners/${id}`);
                fetchBanners();
            } catch (error) {
                console.error("Error deleting banner", error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            description: '',
            image: '',
            link: '',
            btnText: 'Shop Now',
            bgGradientStart: '#8FD3F4',
            bgGradientEnd: '#a2d9ff',
            titleColor: '#ffffff',
            subtitleColor: '#5d67a6',
            descColor: '#ffffff',
            btnBgColor: '#7b8de6',
            btnTextColor: '#ffffff',
            btnRadius: 30,
            position: 'home-slider',
            isActive: true,
            position: 'home-slider',
            isActive: true,
            order: 0,
            showThumbnails: true,
            thumbnails: [
                { image: '', title: 'Placeholder', price: '0' },
                { image: '', title: 'Placeholder', price: '0' },
                { image: '', title: 'Placeholder', price: '0' }
            ]
        });
        setEditId(null);
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Banner Management</h1>
                <button className="btn" onClick={() => { resetForm(); setShowForm(!showForm); }}>
                    {showForm ? <><FaTimes /> Cancel</> : <><FaPlus /> Add Banner</>}
                </button>
            </div>

            {showForm && (
                <>
                    {/* Live Preview Section */}
                    <div className="preview-container-wrapper">
                        <div className="preview-label">Live Design Preview</div>
                        <div className="nike-banner-container-preview">
                            <div
                                className="nike-slide-preview"
                                style={{ background: `linear-gradient(120deg, ${formData.bgGradientStart} 0%, ${formData.bgGradientEnd} 100%)` }}
                            >
                                {/* Logo Preview */}
                                <div className="nike-logo-container-preview">
                                    {/* <svg viewBox="0 0 24 24" className="nike-logo-svg-preview" fill="currentColor">
                                        <path d="M21.196 6.982c-1.854 1.34-4.823 2.507-7.39 3.08-1.503.336-6.19.866-9.136-1.122-1.996-1.345-2.268-3.04-1.1-4.717.387-.557.876-.948 1.48-1.18.232-.088-.306-.118-.387-.118-4.99 0-4.086 5.86-1.077 7.91 3.23 2.2 7.828 1.5 9.773 1.078 2.05-.443 6.096-1.85 7.837-4.93z" />
                                    </svg> */}
                                </div>

                                <div className="decorative-circle-preview"></div>
                                <div className="nike-slide-content-preview">
                                    <div className="nike-text-section-preview">
                                        <h1 className="nike-title-preview" style={{ color: formData.titleColor }}>
                                            {formData.title || 'Banner Title'}
                                        </h1>
                                        {formData.subtitle &&
                                            <h2 className="nike-subtitle-preview" style={{ color: formData.subtitleColor }}>{formData.subtitle}</h2>
                                        }
                                        {formData.description && (
                                            <div className="nike-description-preview" style={{ color: formData.descColor }}>
                                                {formData.description}
                                            </div>
                                        )}
                                        <div className="nike-cta-section-preview">
                                            <span style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px', color: formData.descColor }}></span>
                                            <button
                                                className="nike-btn-preview"
                                                onClick={(e) => e.preventDefault()}
                                                style={{
                                                    backgroundColor: formData.btnBgColor,
                                                    color: formData.btnTextColor,
                                                    borderRadius: `${formData.btnRadius}px`
                                                }}
                                            >
                                                {formData.btnText || 'Shop Now'}
                                            </button>
                                        </div>

                                        {/* Thumbnails Preview */}
                                        {formData.showThumbnails && (
                                            <div className="nike-thumbnails-list-preview">
                                                {formData.thumbnails.map((thumb, i) => (
                                                    <div key={i} className={`nike-thumbnail-card-preview ${i === 0 ? 'active-thumb-preview' : ''}`}>
                                                        <div className="thumb-info-preview">
                                                            <span className="thumb-placeholder-preview">{thumb.title || 'Placeholder'}</span>
                                                            <span className="thumb-price-preview">₹ {thumb.price || '0'}</span>
                                                        </div>
                                                        {thumb.image ? (
                                                            <img src={thumb.image} className="thumb-image-preview" alt="thumb" />
                                                        ) : <div className="thumb-image-placeholder"></div>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="nike-image-section-preview">
                                        <div className="product-card-bg-preview">
                                            {formData.image ? (
                                                <img src={formData.image} alt="Preview" className="nike-shoe-image-preview" onError={(e) => e.target.style.display = 'none'} />
                                            ) : (
                                                <div style={{ color: 'white', opacity: 0.7 }}>Image Preview</div>
                                            )}
                                            <div className="shoe-dots-preview">
                                                <span className="shoe-dot-preview active"></span>
                                                <span className="shoe-dot-preview"></span>
                                                <span className="shoe-dot-preview"></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Editor Form */}
                    <div className="card banner-form-card">
                        <form onSubmit={handleSubmit}>
                            <h3 className="form-section-title">Content</h3>
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Subtitle</label>
                                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} />
                                </div>
                                <div className="form-group half">
                                    <label>Button Text</label>
                                    <input type="text" name="btnText" value={formData.btnText} onChange={handleChange} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="2"></textarea>
                            </div>
                            <div className="form-group">
                                <label>Image URL</label>
                                <input type="text" name="image" value={formData.image} onChange={handleChange} required placeholder="https://..." />
                            </div>

                            <h3 className="form-section-title">Colors & Background</h3>
                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Gradient Start</label>
                                    <div className="color-input-container">
                                        <input type="color" name="bgGradientStart" value={formData.bgGradientStart} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="bgGradientStart" value={formData.bgGradientStart} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group half">
                                    <label>Gradient End</label>
                                    <div className="color-input-container">
                                        <input type="color" name="bgGradientEnd" value={formData.bgGradientEnd} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="bgGradientEnd" value={formData.bgGradientEnd} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="form-section-title">Text Styles</h3>
                            <div className="form-row">
                                <div className="form-group third">
                                    <label>Title Color</label>
                                    <div className="color-input-container">
                                        <input type="color" name="titleColor" value={formData.titleColor} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="titleColor" value={formData.titleColor} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group third">
                                    <label>Subtitle Color</label>
                                    <div className="color-input-container">
                                        <input type="color" name="subtitleColor" value={formData.subtitleColor} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="subtitleColor" value={formData.subtitleColor} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group third">
                                    <label>Desc Color</label>
                                    <div className="color-input-container">
                                        <input type="color" name="descColor" value={formData.descColor} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="descColor" value={formData.descColor} onChange={handleChange} />
                                    </div>
                                </div>
                            </div>

                            <h3 className="form-section-title">Button Styling</h3>
                            <div className="form-row">
                                <div className="form-group third">
                                    <label>Background</label>
                                    <div className="color-input-container">
                                        <input type="color" name="btnBgColor" value={formData.btnBgColor} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="btnBgColor" value={formData.btnBgColor} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group third">
                                    <label>Text Color</label>
                                    <div className="color-input-container">
                                        <input type="color" name="btnTextColor" value={formData.btnTextColor} onChange={handleChange} />
                                        <input type="text" className="color-text-input" name="btnTextColor" value={formData.btnTextColor} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-group third">
                                    <label>Radius (px)</label>
                                    <input type="number" name="btnRadius" value={formData.btnRadius} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group half">
                                    <label>Link URL</label>
                                    <input type="text" name="link" value={formData.link} onChange={handleChange} placeholder="/shop" />
                                </div>
                                <div className="form-group half">
                                    <label>Order Link</label>
                                    <input type="number" name="order" value={formData.order} onChange={handleChange} />
                                </div>
                            </div>

                            <h3 className="form-section-title">Bottom Thumbnails</h3>
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" name="showThumbnails" checked={formData.showThumbnails} onChange={handleChange} />
                                    Show Thumbnails (3 Pics)
                                </label>
                            </div>

                            {formData.showThumbnails && formData.thumbnails.map((thumb, index) => (
                                <div key={index} className="thumbnail-edit-group" style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '4px' }}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Thumbnail {index + 1}</label>
                                    <div className="form-row">
                                        <div className="form-group third">
                                            <label>Image URL</label>
                                            <input
                                                type="text"
                                                value={thumb.image}
                                                onChange={(e) => handleThumbnailChange(index, 'image', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="form-group third">
                                            <label>Title / Placeholder</label>
                                            <input
                                                type="text"
                                                value={thumb.title}
                                                onChange={(e) => handleThumbnailChange(index, 'title', e.target.value)}
                                                placeholder="Title"
                                            />
                                        </div>
                                        <div className="form-group third">
                                            <label>Price</label>
                                            <input
                                                type="text"
                                                value={thumb.price}
                                                onChange={(e) => handleThumbnailChange(index, 'price', e.target.value)}
                                                placeholder="$120"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="form-group checkbox-group">
                                <label>
                                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                    Active Stack
                                </label>
                            </div>
                            <button type="submit" className="btn btn-save">
                                <FaSave /> {editId ? 'Update Banner' : 'Create Banner'}
                            </button>
                        </form>
                    </div>
                </>
            )}

            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Preview</th>
                            <th>Info</th>
                            <th>Order</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {banners.map(banner => (
                            <tr key={banner._id}>
                                <td>
                                    <div style={{
                                        width: '100px',
                                        height: '50px',
                                        background: `linear-gradient(120deg, ${banner.bgGradientStart || '#ccc'} 0%, ${banner.bgGradientEnd || '#eee'} 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <img src={banner.image} alt={banner.title} style={{ height: '80%', objectFit: 'contain' }} />
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{banner.title}</div>
                                    <div style={{ fontSize: '0.85em', color: '#666' }}>{banner.subtitle}</div>
                                </td>
                                <td>{banner.order}</td>
                                <td>
                                    <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                                        {banner.isActive ? 'Active' : 'Hidden'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleEdit(banner)} title="Edit"><FaEdit /></button>
                                    <button className="btn-icon delete" onClick={() => handleDelete(banner._id)} title="Delete"><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                        {banners.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No banners found. Create one to get started!</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Banners;
