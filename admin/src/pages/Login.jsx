import React, { useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/admin-login', {
                email,
                password,
            });

            if (data.isAdmin) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                navigate('/');
                window.location.reload(); // Reload to update App state (sidebar visibility)
            } else {
                setError('You are not authorized as an Admin');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h2>Admin Portal</h2>
                    <p>Please sign in to continue</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={submitHandler} className="login-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
