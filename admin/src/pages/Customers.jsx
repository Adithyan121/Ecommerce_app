import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { FaTrash, FaBan, FaCheckCircle, FaEye } from 'react-icons/fa';
import './Customers.css';

const Customers = () => {
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('customers'); // customers, staff, admins, superadmins
    const [currentUserRole, setCurrentUserRole] = useState('user');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo && userInfo.role) {
            setCurrentUserRole(userInfo.role);
        } else if (userInfo && userInfo.isAdmin) {
            setCurrentUserRole('admin');
        }
        fetchUsers();
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            let endpoint = '/users';
            if (activeTab === 'staff') endpoint = '/users/type/staff';
            if (activeTab === 'admins') endpoint = '/users/type/admins';
            if (activeTab === 'superadmins') endpoint = '/users/type/superadmins';

            const { data } = await api.get(endpoint);
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const deleteUser = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error("Error deleting user", error);
                alert('Failed to delete. You may not have permission.');
            }
        }
    };

    const toggleBan = async (id) => {
        try {
            await api.put(`/users/${id}/ban`, {});
            fetchUsers();
        } catch (error) {
            console.error("Error banning/unbanning user", error);
            alert('Failed to update status. You may not have permission.');
        }
    };

    const promoteStaff = async (id) => {
        if (window.confirm('Are you sure you want to promote this Staff member to Admin?')) {
            try {
                await api.put(`/users/promote-staff/${id}`);
                alert('Staff promoted successfully!');
                fetchUsers();
            } catch (error) {
                console.error("Error promoting staff", error);
                alert('Failed to promote staff.');
            }
        }
    };

    const seedData = async () => {
        try {
            await api.post('/users/seed-data');
            alert('Seed data added! Refreshing...');
            fetchUsers();
        } catch (error) {
            alert('Error seeding data');
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: 'staff' // default
    });

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            let endpoint = '';
            if (newUser.role === 'admin') endpoint = '/users/add-admin';
            else if (newUser.role === 'staff') endpoint = '/users/add-staff';
            else if (newUser.role === 'superadmin') endpoint = '/users/add-superadmin';
            else {
                alert('Invalid role selected.');
                return;
            }

            await api.post(endpoint, newUser);
            alert(`${newUser.role} created successfully!`);
            setShowAddModal(false);
            setNewUser({ name: '', email: '', password: '', phone: '', role: 'staff' });
            // Refresh list if on that tab
            if (activeTab === newUser.role + 's' || activeTab === newUser.role) {
                fetchUsers();
            }
        } catch (error) {
            console.error("Error creating user", error);
            alert(error.response?.data?.message || 'Error creating user');
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>User Management</h1>
                <div className="btn-action-group">
                    {(currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                        <button onClick={() => setShowAddModal(true)} className="btn-add-user">
                            + Add User
                        </button>
                    )}
                    {/* <button onClick={seedData} className="btn-seed">
                        Seed Temporary Data
                    </button> */}
                </div>
            </div>

            <div className="form-tabs">
                <button className={`tab-btn ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>Customers</button>
                {/* Apps allow Admin/SuperAdmin to see Staff/Admins */}
                {(currentUserRole === 'admin' || currentUserRole === 'superadmin') && (
                    <>
                        <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} onClick={() => setActiveTab('staff')}>Staff</button>
                        <button className={`tab-btn ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>Admins</button>
                    </>
                )}
                {/* Only SuperAdmin sees SuperAdmins */}
                {currentUserRole === 'superadmin' && (
                    <button className={`tab-btn ${activeTab === 'superadmins' ? 'active' : ''}`} onClick={() => setActiveTab('superadmins')}>Super Admins</button>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: 'white', padding: '2rem', borderRadius: '8px', width: '400px'
                    }}>
                        <h2>Add New User</h2>
                        <form onSubmit={handleAddUser}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem' }}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="admin">Admin</option>
                                    {currentUserRole === 'superadmin' && <option value="superadmin">Super Admin</option>}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Name</label>
                                <input required type="text" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Email</label>
                                <input required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Password</label>
                                <input required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label>Phone</label>
                                <input type="text" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} style={{ width: '100%', padding: '0.5rem' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn-add-user" style={{ padding: '0.5rem 1rem' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            {activeTab === 'customers' && <th>Status</th>}
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <div className="product-name">{user.name}</div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="badge info">
                                        {user.role || (user.isAdmin ? 'Admin' : activeTab.slice(0, -1))}
                                    </span>
                                </td>
                                {activeTab === 'customers' && (
                                    <td>
                                        <span className={`badge ${user.isBlocked ? 'danger' : 'success'}`}>
                                            {user.isBlocked ? 'Banned' : 'Active'}
                                        </span>
                                    </td>
                                )}
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="actions-group" style={{ display: 'flex', gap: '10px' }}>
                                        <Link to={`/customers/${user._id}`} className="btn-icon" title="View Details" style={{ color: '#3b82f6' }}>
                                            <FaEye />
                                        </Link>

                                        {/* Promote logic for Staff (SuperAdmin only) */}
                                        {activeTab === 'staff' && currentUserRole === 'superadmin' && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => promoteStaff(user._id)}
                                                title="Promote to Admin"
                                                style={{ color: '#8b5cf6' }}
                                            >
                                                ↑
                                            </button>
                                        )}

                                        {/* Block/Delete Logic based on Role */}
                                        {(activeTab === 'customers' || currentUserRole === 'superadmin' || (currentUserRole === 'admin' && activeTab === 'staff')) && (
                                            <>
                                                <button
                                                    className={`btn-icon ${user.isBlocked ? 'success' : 'warning'}`}
                                                    onClick={() => toggleBan(user._id)}
                                                    title={user.isBlocked ? "Unban" : "Ban"}
                                                    style={{ color: user.isBlocked ? 'green' : 'orange' }}
                                                >
                                                    {user.isBlocked ? <FaCheckCircle /> : <FaBan />}
                                                </button>
                                                <button className="btn-icon delete" onClick={() => deleteUser(user._id)} title="Delete">
                                                    <FaTrash />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>No users found in this category.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Customers;
