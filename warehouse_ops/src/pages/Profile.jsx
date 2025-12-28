import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaUser, FaWarehouse, FaCog, FaSignOutAlt, FaMoon, FaSun, FaVolumeUp, FaVolumeMute, FaGlobe } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Preferences State
    const [theme, setTheme] = useState('dark');
    const [scanSound, setScanSound] = useState(true);
    const [language, setLanguage] = useState('en');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/profile');
            setProfile(res.data);

            // Set local state from profile prefs
            if (res.data.preferences) {
                setTheme(res.data.preferences.theme || 'dark');
                setScanSound(res.data.preferences.scanSound !== false); // default true
                setLanguage(res.data.preferences.language || 'en');
            }
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load profile');
            setLoading(false);
        }
    };

    const handleSavePreferences = async () => {
        try {
            const updatedPrefs = {
                theme,
                scanSound,
                language
            };

            const res = await api.put('/users/profile', {
                preferences: updatedPrefs
            });

            setProfile(res.data);
            toast.success('Preferences Saved');

            // Apply Theme immediately (Mock implementation)
            // In a real app, this would update a Context or document.body class
            document.body.setAttribute('data-theme', theme);

        } catch (error) {
            console.error(error);
            toast.error('Failed to save settings');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (loading) return <div className="container" style={{ paddingTop: '2rem', textAlign: 'center' }}>Loading...</div>;

    if (!profile) return <div className="container">Error loading profile.</div>;

    return (
        <div className="container" style={{ paddingBottom: '80px' }}>
            {/* Header */}
            <div className="navbar" style={{ marginBottom: '1rem', background: 'transparent' }}>
                <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}>
                    <FaArrowLeft />
                </button>
                <h3>Profile</h3>
                <div style={{ width: 30 }}></div>
            </div>

            {/* Profile Card */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem', marginBottom: '1rem' }}>
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto',
                    fontSize: '2rem', color: '#121212'
                }}>
                    {profile.name.charAt(0).toUpperCase()}
                </div>
                <h2>{profile.name}</h2>
                <p style={{ color: 'var(--text-medium-emphasis)' }}>{profile.email}</p>
                <span className="badge" style={{ marginTop: '0.5rem', background: '#333' }}>
                    {profile.role.toUpperCase()}
                </span>
            </div>

            {/* Warehouses */}
            <h4 style={{ marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaWarehouse /> Assigned Warehouses
            </h4>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                {profile.assignedWarehouses && profile.assignedWarehouses.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {profile.assignedWarehouses.map((wh, idx) => (
                            <li key={idx} style={{ padding: '0.5rem 0', borderBottom: idx < profile.assignedWarehouses.length - 1 ? '1px solid #333' : 'none' }}>
                                <strong>{wh.name}</strong> <br />
                                <span style={{ fontSize: '0.8rem', color: '#888' }}>{wh.code}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={{ color: '#888', fontStyle: 'italic' }}>No specific warehouse assigned (All Access or None)</p>
                )}
            </div>

            {/* Settings */}
            <h4 style={{ marginLeft: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCog /> App Preferences
            </h4>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
                {/* Theme */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {theme === 'dark' ? <FaMoon /> : <FaSun />} Theme
                    </span>
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="btn"
                        style={{ width: 'auto', padding: '0.25rem 0.75rem', fontSize: '0.9rem', background: '#333' }}
                    >
                        {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                </div>

                {/* Sound */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #333' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {scanSound ? <FaVolumeUp /> : <FaVolumeMute />} Scan Sounds
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            checked={scanSound}
                            onChange={(e) => setScanSound(e.target.checked)}
                            style={{ transform: 'scale(1.5)', marginRight: '0.5rem' }}
                        />
                    </div>
                </div>

                {/* Language */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderTop: '1px solid #333' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaGlobe /> Language
                    </span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        style={{ padding: '0.25rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px' }}
                    >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                    </select>
                </div>

                <button onClick={handleSavePreferences} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                    Save Preferences
                </button>
            </div>

            <button onClick={handleLogout} className="btn" style={{ background: 'var(--error-color)', color: '#fff', width: '100%' }}>
                <FaSignOutAlt style={{ marginBottom: '-2px', marginRight: '5px' }} /> Logout
            </button>

        </div>
    );
};

export default Profile;
