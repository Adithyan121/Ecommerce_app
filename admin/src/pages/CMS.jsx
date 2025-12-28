import React, { useEffect, useState } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaEye } from 'react-icons/fa';
import './CMS.css';

const CMS = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        metaTitle: '',
        metaDescription: '',
        isPublished: true
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const { data } = await api.get('/cms');
            setPages(data);
        } catch (error) {
            console.error("Error fetching pages", error);
        }
    };

    const handleEdit = (page) => {
        setSelectedPage(page);
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content,
            metaTitle: page.metaTitle || '',
            metaDescription: page.metaDescription || '',
            isPublished: page.isPublished
        });
        setIsEditing(true);
    };

    const handleCreate = () => {
        setSelectedPage(null);
        setFormData({
            title: '',
            slug: '',
            content: '',
            metaTitle: '',
            metaDescription: '',
            isPublished: true
        });
        setIsEditing(true);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedPage) {
                await api.put(`/cms/${selectedPage._id}`, formData);
            } else {
                await api.post('/cms', formData);
            }
            setIsEditing(false);
            fetchPages();
            toast.success(selectedPage ? "Page updated successfully!" : "Page created successfully!");
        } catch (error) {
            console.error("Error saving page", error);
            toast.error(error.response?.data?.message || "Error saving page");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this page?')) {
            try {
                await api.delete(`/cms/${id}`);
                fetchPages();
            } catch (error) {
                console.error("Delete error", error);
            }
        }
    };

    if (isEditing) {
        return (
            <div className="cms-container">
                <div className="cms-header">
                    <h2>{selectedPage ? 'Edit Page' : 'Create New Page'}</h2>
                    <button onClick={() => setIsEditing(false)} className="btn-secondary">
                        <FaTimes /> Cancel
                    </button>
                </div>

                <div className="cms-editor-container">
                    {/* Left: Form Editor */}
                    <div className="cms-form-panel">
                        <form onSubmit={handleSubmit}>
                            <div className="cms-form-group">
                                <label>Page Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., About Us"
                                />
                            </div>
                            <div className="cms-form-group">
                                <label>URL Slug (path)</label>
                                <input
                                    type="text"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., about-us"
                                />
                            </div>
                            <div className="cms-form-group">
                                <label>Content (HTML Supported)</label>
                                <textarea
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    required
                                    placeholder="<h1>Welcome</h1><p>This is where you write your page content...</p>"
                                />
                            </div>
                            <div className="cms-form-group">
                                <label>SEO Meta Title</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="cms-form-group" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    style={{ width: '20px' }}
                                />
                                <label style={{ marginBottom: 0 }}>Published</label>
                            </div>
                            <div className="cms-actions">
                                <button type="submit" className="btn-primary">
                                    <FaSave /> Save Page
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right: Live Preview */}
                    <div className="cms-preview-panel">
                        <div className="preview-label">Live Preview</div>
                        <div className="cms-preview-content">
                            {/* Simple HTML rendering for preview */}
                            <div dangerouslySetInnerHTML={{ __html: formData.content || '<p style="color:#aaa; text-align:center; padding-top:2rem;">Start typing content to see preview...</p>' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="products-header">
                <h1>Content Management System</h1>
                <button className="btn" onClick={handleCreate}>
                    <FaPlus /> Create New Page
                </button>
            </div>
            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>URL Slug</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page._id}>
                                <td>{page.title}</td>
                                <td>/{page.slug}</td>
                                <td>
                                    <span className={`status-badge ${page.isPublished ? 'active' : 'inactive'}`}>
                                        {page.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-icon" onClick={() => handleEdit(page)} title="Edit">
                                        <FaEdit />
                                    </button>
                                    <button className="btn-icon delete" onClick={() => handleDelete(page._id)} title="Delete">
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {pages.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                                    <p>No pages found.</p>
                                    <button className="btn" onClick={handleCreate} style={{ marginTop: '1rem' }}>
                                        Create your first page
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CMS;
