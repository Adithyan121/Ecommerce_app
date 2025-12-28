import React, { useState } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/staff-login', { email, password });

            // Check roles? 
            // The user assumes "Warehouse Staff" role exists.
            // For now, assume any logged in user can access (protected by api middleware).

            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('Logged in successfully');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100vh' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Warehouse Login</h1>
            <div className="card">
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        id="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                    />
                    <input
                        type="password"
                        id="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field"
                    />
                    <button type="submit" className="btn btn-primary">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
