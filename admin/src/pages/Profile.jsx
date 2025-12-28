import React, { useEffect, useState } from 'react';
import api from '../api';
import './Dashboard.css'; // Reuse dashboard styles for cards

const Profile = () => {
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Assuming GET /users/profile returns current user info based on token
                const { data } = await api.get('/users/profile');
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile", error);
            }
        };

        fetchProfile();
    }, []);

    if (!profile) return <div>Loading...</div>;

    return (
        <div className="container">
            <h1>Admin Profile</h1>
            <div className="card" style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: '#e5e7eb', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '3rem', color: '#9ca3af'
                    }}>
                        {profile.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2>{profile.name}</h2>
                        <span className="badge info" style={{ fontSize: '1rem' }}>
                            {profile.role || (profile.isAdmin ? 'Admin' : 'Staff')}
                        </span>
                    </div>
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <p style={{ fontSize: '1.1rem', padding: '0.5rem 0' }}>{profile.email}</p>
                </div>

                <div className="form-group">
                    <label>Phone</label>
                    <p style={{ fontSize: '1.1rem', padding: '0.5rem 0' }}>{profile.phone || 'N/A'}</p>
                </div>

                <div className="form-group">
                    <label>User ID</label>
                    <p style={{ color: '#6b7280', fontFamily: 'monospace' }}>{profile._id}</p>
                </div>
            </div>
        </div>
    );
};

export default Profile;
