import React, { useEffect, useState } from 'react';
import api from '../api';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import { FaTrash } from 'react-icons/fa';
import './Products.css';

const Marketing = () => {
    const [banners, setBanners] = useState([]);
    const [title, setTitle] = useState('');
    const [link, setLink] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        const { data } = await api.get('/marketing');
        setBanners(data);
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!imageFile) {
            alert("Please select an image");
            return;
        }

        setLoading(true);
        try {
            const storageRef = ref(storage, `marketing/${Date.now()}_${imageFile.name}`);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            await api.post('/marketing', {
                title,
                image: imageUrl,
                link
            });

            setTitle('');
            setLink('');
            setImageFile(null);
            document.getElementById('banner-image-input').value = '';
            fetchBanners();
        } catch (error) {
            console.error("Error uploading banner", error);
            alert("Failed to upload banner");
        } finally {
            setLoading(false);
        }
    };

    const deleteBanner = async (id) => {
        if (window.confirm('Delete this banner?')) {
            try {
                await api.delete(`/marketing/${id}`);
                fetchBanners();
            } catch (error) {
                console.error("Error deleting banner", error);
            }
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Marketing & Banners</h1>
            </div>
            <div className="dashboard-content">
                <div className="card">
                    <h3>Add New Banner</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Banner Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Summer Sale"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Target Link (Optional)</label>
                            <input
                                type="text"
                                value={link}
                                onChange={e => setLink(e.target.value)}
                                placeholder="e.g., /category/summer"
                            />
                        </div>
                        <div className="form-group">
                            <label>Banner Image</label>
                            <input
                                type="file"
                                id="banner-image-input"
                                onChange={handleImageChange}
                                accept="image/*"
                                required
                            />
                            <small>Recommended size: 1200x400 pixels</small>
                        </div>
                        <button className="btn" disabled={loading}>
                            {loading ? 'Uploading...' : 'Add Banner'}
                        </button>
                    </form>
                </div>

                <div className="card">
                    <h3>Active Banners</h3>
                    {banners.length === 0 ? (
                        <p>No banners active.</p>
                    ) : (
                        <div className="banner-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
                            {banners.map(banner => (
                                <div key={banner._id} style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                                    <div style={{ height: '120px', overflow: 'hidden' }}>
                                        <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{banner.title}</h4>
                                        {banner.link && <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Link: {banner.link}</p>}
                                        <button
                                            className="btn-icon delete"
                                            onClick={() => deleteBanner(banner._id)}
                                            style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            <FaTrash /> Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Marketing;
