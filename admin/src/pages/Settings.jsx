import React, { useState, useEffect } from 'react';
import api from '../api';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import './Form.css';

const Settings = () => {
    const [settings, setSettings] = useState({
        store: {
            name: '',
            logo: '',
            address: '',
            email: '',
            phone: '',
            currency: 'USD',
            language: 'en',
            timezone: 'UTC'
        },
        payment: {
            cod: true,
            stripe: false,
            paypal: false,
            stripeKey: '',
            paypalKey: '',
            testMode: true
        },
        shipping: {
            enabled: true,
            charge: 0,
            freeThreshold: 0
        },
        tax: {
            enabled: false,
            percentage: 0
        },
        email: {
            sender: '',
            host: '',
            port: '',
            user: '',
            password: ''
        },
        order: {
            defaultStatus: 'Processing',
            cancelUnpaidHours: 24
        },
        customer: {
            guestCheckout: true,
            registration: true
        }
    });

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [logoFile, setLogoFile] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');

            // Merge fetched settings with default state
            if (data) {
                setSettings(prev => ({
                    ...prev,
                    ...data
                }));
            }
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const handleChange = (section, field, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    const handleLogoChange = (e) => {
        if (e.target.files[0]) {
            setLogoFile(e.target.files[0]);
        }
    };

    const saveSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let updatedSettings = { ...settings };

            // Upload logo if a new file is selected
            if (logoFile) {
                const storageRef = ref(storage, `settings/${Date.now()}_${logoFile.name}`);
                await uploadBytes(storageRef, logoFile);
                const logoUrl = await getDownloadURL(storageRef);
                updatedSettings.store.logo = logoUrl;
            }

            await api.post('/settings', updatedSettings);

            // Update local state with new logo URL if uploaded
            if (logoFile) {
                setSettings(updatedSettings);
                setLogoFile(null);
            }

            alert('Settings Saved Successfully');
        } catch (error) {
            alert('Error saving settings');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        try {
            await api.put('/users/profile', { password });
            alert('Password Updated Successfully');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            alert('Error updating password');
            console.error(error);
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Settings</h1>
            </div>

            <form onSubmit={saveSettings}>
                {/* 1. Store Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>1️⃣ Store Settings</h3>
                    <div className="form-group">
                        <label>Store Name</label>
                        <input type="text" value={settings.store.name} onChange={(e) => handleChange('store', 'name', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Store Logo</label>
                        <input type="file" onChange={handleLogoChange} accept="image/*" />
                        {settings.store.logo && (
                            <div style={{ marginTop: '10px' }}>
                                <p style={{ fontSize: '0.8rem', color: '#666' }}>Current Logo:</p>
                                <img src={settings.store.logo} alt="Store Logo" style={{ height: '50px', objectFit: 'contain' }} />
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Store Address</label>
                        <textarea value={settings.store.address} onChange={(e) => handleChange('store', 'address', e.target.value)}></textarea>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Contact Email</label>
                            <input type="email" value={settings.store.email} onChange={(e) => handleChange('store', 'email', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input type="text" value={settings.store.phone} onChange={(e) => handleChange('store', 'phone', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Default Currency</label>
                            <select value={settings.store.currency} onChange={(e) => handleChange('store', 'currency', e.target.value)}>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="INR">INR (₹)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Default Language</label>
                            <select value={settings.store.language} onChange={(e) => handleChange('store', 'language', e.target.value)}>
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Timezone</label>
                            <select value={settings.store.timezone} onChange={(e) => handleChange('store', 'timezone', e.target.value)}>
                                <option value="UTC">UTC</option>
                                <option value="EST">EST</option>
                                <option value="PST">PST</option>
                                <option value="IST">IST</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 2. Payment Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>2️⃣ Payment Settings</h3>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.payment.cod} onChange={(e) => handleChange('payment', 'cod', e.target.checked)} />
                            Enable Cash on Delivery (COD)
                        </label>
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.payment.stripe} onChange={(e) => handleChange('payment', 'stripe', e.target.checked)} />
                            Enable Stripe
                        </label>
                    </div>
                    {settings.payment.stripe && (
                        <div className="form-group">
                            <label>Stripe API Key</label>
                            <input type="text" value={settings.payment.stripeKey} onChange={(e) => handleChange('payment', 'stripeKey', e.target.value)} />
                        </div>
                    )}
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.payment.paypal} onChange={(e) => handleChange('payment', 'paypal', e.target.checked)} />
                            Enable PayPal
                        </label>
                    </div>
                    {settings.payment.paypal && (
                        <div className="form-group">
                            <label>PayPal API Key</label>
                            <input type="text" value={settings.payment.paypalKey} onChange={(e) => handleChange('payment', 'paypalKey', e.target.value)} />
                        </div>
                    )}
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.payment.testMode} onChange={(e) => handleChange('payment', 'testMode', e.target.checked)} />
                            Enable Test Mode
                        </label>
                    </div>
                </div>

                {/* 3. Shipping Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>3️⃣ Shipping Settings</h3>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.shipping.enabled} onChange={(e) => handleChange('shipping', 'enabled', e.target.checked)} />
                            Enable Shipping
                        </label>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Delivery Charges</label>
                            <input type="number" value={settings.shipping.charge} onChange={(e) => handleChange('shipping', 'charge', Number(e.target.value))} />
                        </div>
                        <div className="form-group">
                            <label>Free Shipping Minimum Amount</label>
                            <input type="number" value={settings.shipping.freeThreshold} onChange={(e) => handleChange('shipping', 'freeThreshold', Number(e.target.value))} />
                        </div>
                    </div>
                </div>

                {/* 4. Tax Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>4️⃣ Tax Settings</h3>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.tax.enabled} onChange={(e) => handleChange('tax', 'enabled', e.target.checked)} />
                            Enable Tax
                        </label>
                    </div>
                    <div className="form-group">
                        <label>Tax Percentage (%)</label>
                        <input type="number" value={settings.tax.percentage} onChange={(e) => handleChange('tax', 'percentage', Number(e.target.value))} />
                    </div>
                </div>

                {/* 5. Email Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>5️⃣ Email Settings</h3>
                    <div className="form-group">
                        <label>Sender Email</label>
                        <input type="email" value={settings.email.sender} onChange={(e) => handleChange('email', 'sender', e.target.value)} />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>SMTP Host</label>
                            <input type="text" value={settings.email.host} onChange={(e) => handleChange('email', 'host', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>SMTP Port</label>
                            <input type="text" value={settings.email.port} onChange={(e) => handleChange('email', 'port', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>SMTP Username</label>
                            <input type="text" value={settings.email.user} onChange={(e) => handleChange('email', 'user', e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>SMTP Password</label>
                            <input type="password" value={settings.email.password} onChange={(e) => handleChange('email', 'password', e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* 6. Security Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>6️⃣ Security Settings</h3>
                    <div className="form-group">
                        <label>Change Admin Password</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input type="password" placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                            <button type="button" className="btn" onClick={updatePassword}>Update Password</button>
                        </div>
                    </div>
                </div>

                {/* 7. Order Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>7️⃣ Order Settings</h3>
                    <div className="form-group">
                        <label>Default Order Status</label>
                        <select value={settings.order.defaultStatus} onChange={(e) => handleChange('order', 'defaultStatus', e.target.value)}>
                            <option value="Processing">Processing</option>
                            <option value="Pending">Pending</option>
                            <option value="On Hold">On Hold</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Cancel Unpaid Orders After (Hours)</label>
                        <input type="number" value={settings.order.cancelUnpaidHours} onChange={(e) => handleChange('order', 'cancelUnpaidHours', Number(e.target.value))} />
                    </div>
                </div>

                {/* 8. Customer Settings */}
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h3>8️⃣ Customer Settings</h3>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.customer.guestCheckout} onChange={(e) => handleChange('customer', 'guestCheckout', e.target.checked)} />
                            Enable Guest Checkout
                        </label>
                    </div>
                    <div className="form-group checkbox-group">
                        <label>
                            <input type="checkbox" checked={settings.customer.registration} onChange={(e) => handleChange('customer', 'registration', e.target.checked)} />
                            Enable Customer Registration
                        </label>
                    </div>
                </div>

                <button type="submit" className="btn btn-large" disabled={loading}>
                    {loading ? 'Saving...' : 'Save All Settings'}
                </button>
            </form>
        </div>
    );
};

export default Settings;
