import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import './Form.css';

const AddProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get product ID if editing
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        category: '',
        stock: '',
        sku: '',
        barcode: '',
        weight: '',
        status: 'active',
        visibility: 'published',
        tags: '',
        metaTitle: '',
        metaDescription: ''
    });

    // Unified state for images (both files and URLs)
    const [mediaItems, setMediaItems] = useState([]);
    const [variants, setVariants] = useState([]);

    useEffect(() => {
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setFormData({
                name: data.name || '',
                description: data.description || '',
                price: data.price || '',
                salePrice: data.salePrice || '',
                category: data.category || '',
                stock: data.stock || '',
                sku: data.sku || '',
                barcode: data.barcode || '',
                weight: data.weight || '',
                status: data.status || 'active',
                visibility: data.visibility || 'published',
                tags: data.tags ? data.tags.join(', ') : '',
                metaTitle: data.seo?.metaTitle || '',
                metaDescription: data.seo?.metaDescription || ''
            });

            let initialMedia = [];
            if (data.images && data.images.length > 0) {
                initialMedia = data.images.map(url => ({ type: 'url', content: url, preview: url }));
            } else if (data.image) {
                initialMedia = [{ type: 'url', content: data.image, preview: data.image }];
            }
            setMediaItems(initialMedia);

            if (data.variants) {
                // Map existing variant images to indices in initialMedia
                const loadedVariants = data.variants.map(v => ({
                    ...v,
                    options: v.options.map(opt => ({
                        ...opt,
                        assignedImageIndices: opt.images ? opt.images.map(imgUrl =>
                            initialMedia.findIndex(m => m.content === imgUrl)
                        ).filter(i => i !== -1) : []
                    }))
                }));
                setVariants(loadedVariants);
            }
        } catch (error) {
            console.error("Error fetching product", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newItems = files.map(file => ({
                type: 'file',
                content: file,
                preview: URL.createObjectURL(file)
            }));
            setMediaItems(prev => [...prev, ...newItems]);
        }
    };

    const removeMedia = (index) => {
        setMediaItems(prev => prev.filter((_, i) => i !== index));
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', options: [{ value: '', priceModifier: 0, stock: 0, sku: '', assignedImageIndices: [] }] }]);
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariantOption = (variantIndex) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options.push({ value: '', priceModifier: 0, stock: 0, sku: '', assignedImageIndices: [] });
        setVariants(newVariants);
    };

    const updateVariantOption = (variantIndex, optionIndex, field, value) => {
        const newVariants = [...variants];
        newVariants[variantIndex].options[optionIndex][field] = value;
        setVariants(newVariants);
    };

    const toggleImageSelection = (vIndex, oIndex, imgIndex) => {
        const newVariants = [...variants];
        const option = newVariants[vIndex].options[oIndex];
        const currentIndices = option.assignedImageIndices || [];

        if (currentIndices.includes(imgIndex)) {
            option.assignedImageIndices = currentIndices.filter(i => i !== imgIndex);
        } else {
            option.assignedImageIndices = [...currentIndices, imgIndex];
        }
        setVariants(newVariants);
    };

    const generateSEO = () => {
        const { name, description, category, tags } = formData;

        // Generate Title (Max ~60 chars ideal, but can be longer)
        const generatedTitle = `${name} - Best Price Online | ShopWave`;

        // Generate Description (First 160 chars)
        const stripHtml = description.replace(/<[^>]*>?/gm, ''); // Simple strip if rich text used later
        const generatedDesc = stripHtml.substring(0, 155) + (stripHtml.length > 155 ? '...' : '');

        // Generate Tags
        const existingTags = tags ? tags.split(',').map(t => t.trim()) : [];
        const nameKeywords = name.toLowerCase().split(' ').filter(word => word.length > 2);
        const newTags = [...new Set([...existingTags, category.toLowerCase(), ...nameKeywords])].join(', ');

        setFormData(prev => ({
            ...prev,
            metaTitle: prev.metaTitle || generatedTitle,
            metaDescription: prev.metaDescription || generatedDesc,
            tags: prev.tags || newTags
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload new files and get all URLs in order matching mediaItems
            const finalImages = await Promise.all(mediaItems.map(async (item) => {
                if (item.type === 'url') {
                    return item.content;
                } else {
                    const storageRef = ref(storage, `products/${Date.now()}_${item.content.name}`);
                    await uploadBytes(storageRef, item.content);
                    return await getDownloadURL(storageRef);
                }
            }));

            // Sanitize and structure payload
            const cleanData = { ...formData };

            // Handle numbers (convert empty strings to undefined/null to avoid CastError)
            cleanData.price = cleanData.price !== '' ? Number(cleanData.price) : 0;
            cleanData.stock = cleanData.stock !== '' ? Number(cleanData.stock) : 0;
            cleanData.salePrice = cleanData.salePrice !== '' ? Number(cleanData.salePrice) : null;
            cleanData.weight = cleanData.weight !== '' ? Number(cleanData.weight) : null;

            // Handle SKU (empty string should be undefined to avoid unique index collision with sparse)
            if (cleanData.sku === '') {
                delete cleanData.sku;
            }

            // Handle SEO structure
            cleanData.seo = {
                metaTitle: cleanData.metaTitle,
                metaDescription: cleanData.metaDescription
            };
            delete cleanData.metaTitle;
            delete cleanData.metaDescription;

            const payload = {
                ...cleanData,
                images: finalImages,
                image: finalImages[0] || '', // Main image
                tags: cleanData.tags ? cleanData.tags.split(',').map(tag => tag.trim()) : [],
                variants: variants.map(v => ({
                    ...v,
                    options: v.options.map(opt => ({
                        value: opt.value,
                        priceModifier: opt.priceModifier,
                        stock: opt.stock,
                        sku: opt.sku,
                        images: opt.assignedImageIndices?.map(i => finalImages[i]) || []
                    }))
                }))
            };

            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
            } else {
                await api.post('/products', payload);
            }

            navigate('/products');
        } catch (error) {
            console.error(error);
            alert('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container container">
            <div className="form-header">
                <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/products')}>Cancel</button>
                    <button type="submit" form="product-form" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <div className="form-tabs">
                <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
                <button className={`tab-btn ${activeTab === 'pricing' ? 'active' : ''}`} onClick={() => setActiveTab('pricing')}>Pricing & Inventory</button>
                <button className={`tab-btn ${activeTab === 'variants' ? 'active' : ''}`} onClick={() => setActiveTab('variants')}>Variants</button>
                <button className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`} onClick={() => setActiveTab('seo')}>SEO</button>
            </div>

            <form id="product-form" onSubmit={handleSubmit} className="product-form">
                {activeTab === 'general' && (
                    <div className="form-section">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="5" required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Images</label>

                            {/* File Upload */}
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Upload Files:</p>
                                <input type="file" multiple onChange={handleImageChange} accept="image/*" />
                            </div>

                            <div className="image-previews">
                                {mediaItems.map((item, i) => (
                                    <div key={i} className="preview-container">
                                        <img src={item.preview} alt="Preview" />
                                        <button type="button" onClick={() => removeMedia(i)}>×</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="form-section">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Regular Price</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Sale Price</label>
                                <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>SKU</label>
                                <input type="text" name="sku" value={formData.sku} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Barcode</label>
                                <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Stock Quantity</label>
                                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Weight (kg)</label>
                                <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'variants' && (
                    <div className="form-section">
                        <button type="button" className="btn btn-secondary" onClick={addVariant}>+ Add Variant Type</button>
                        {variants.map((variant, vIndex) => (
                            <div key={vIndex} className="variant-card">
                                <div className="form-group">
                                    <label>Variant Name (e.g. Size)</label>
                                    <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(vIndex, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="variant-options">
                                    {variant.options.map((option, oIndex) => (
                                        <div key={oIndex} className="variant-option-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Value (e.g. XL)"
                                                    value={option.value}
                                                    onChange={(e) => updateVariantOption(vIndex, oIndex, 'value', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="SKU"
                                                    value={option.sku || ''}
                                                    onChange={(e) => updateVariantOption(vIndex, oIndex, 'sku', e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Price Mod (+/-)"
                                                    value={option.priceModifier}
                                                    onChange={(e) => updateVariantOption(vIndex, oIndex, 'priceModifier', e.target.value)}
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Stock"
                                                    value={option.stock}
                                                    onChange={(e) => updateVariantOption(vIndex, oIndex, 'stock', e.target.value)}
                                                />
                                            </div>

                                            <div className="variant-images-select" style={{ width: '100%' }}>
                                                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: '#666' }}>Select images for this variant (e.g. {option.value || 'Color'}):</p>
                                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                    {mediaItems.map((media, mIndex) => {
                                                        const isSelected = option.assignedImageIndices?.includes(mIndex);
                                                        return (
                                                            <div
                                                                key={mIndex}
                                                                onClick={() => toggleImageSelection(vIndex, oIndex, mIndex)}
                                                                style={{
                                                                    width: '50px',
                                                                    height: '50px',
                                                                    border: isSelected ? '3px solid #007bff' : '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer',
                                                                    opacity: isSelected ? 1 : 0.6,
                                                                    overflow: 'hidden'
                                                                }}
                                                            >
                                                                <img src={media.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </div>
                                                        );
                                                    })}
                                                    {mediaItems.length === 0 && <span style={{ fontSize: '0.8rem', color: '#999' }}>Upload images in General tab first.</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" className="btn-small" onClick={() => addVariantOption(vIndex)}>+ Add Option</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'seo' && (
                    <div className="form-section">
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn-secondary" onClick={generateSEO}>✨ Auto-Generate SEO</button>
                        </div>
                        <div className="form-group">
                            <label>Meta Title</label>
                            <input type="text" name="metaTitle" value={formData.metaTitle} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Meta Description</label>
                            <textarea name="metaDescription" value={formData.metaDescription} onChange={handleChange} rows="3" />
                        </div>
                        <div className="form-group">
                            <label>Tags (comma separated)</label>
                            <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="electronics, sale, new" />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddProduct;
