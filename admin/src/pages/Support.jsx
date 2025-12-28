import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import api, { SOCKET_URL } from '../api';
import './Support.css';
import { FaUser, FaPaperPlane } from 'react-icons/fa';

const socket = io.connect(SOCKET_URL);

const Support = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reply, setReply] = useState("");
    const messagesEndRef = useRef(null);

    const location = useLocation();

    // Get Admin Info
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    // Listen for new messages
    useEffect(() => {
        const handleMessage = (data) => {
            // Update messages if currently viewing that user
            if (selectedUser && (data.sender === selectedUser._id || data.receiver === selectedUser._id)) {
                setMessages((prev) => [...prev, data]);
                scrollToBottom();
            }

            // Update user list: move sender to top and mark as unread if necessary
            setUsers(prevUsers => {
                const senderId = data.isAdmin ? data.receiver : data.sender;
                const senderIndex = prevUsers.findIndex(u => u._id === senderId);

                if (senderIndex === -1) return prevUsers; // User not found (shouldn't happen if list is complete)

                const updatedUsers = [...prevUsers];
                const user = updatedUsers[senderIndex];

                // Remove from current position
                updatedUsers.splice(senderIndex, 1);

                // Add to top with updated status
                const isUnread = (!selectedUser || selectedUser._id !== senderId) && !data.isAdmin;

                updatedUsers.unshift({
                    ...user,
                    hasUnread: user.hasUnread || isUnread,
                    lastMessageTime: new Date()
                });

                return updatedUsers;
            });
        };

        socket.on('receive_message', handleMessage);

        return () => {
            socket.off('receive_message', handleMessage);
        };
    }, [selectedUser]);

    // Auto-select user from URL when users are loaded
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const userId = params.get('user');
        if (userId && users.length > 0) {
            const targetUser = users.find(u => u._id === userId);
            if (targetUser && targetUser._id !== selectedUser?._id) {
                selectUser(targetUser);
            }
        }
    }, [users, location.search]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            // Filter out the current admin if needed, or just show all
            const filteredUsers = data.filter(u => u._id !== userInfo?._id);
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching users", error);
        }
    };

    const selectUser = async (user) => {
        // Clear unread status
        setUsers(prev => prev.map(u =>
            u._id === user._id ? { ...u, hasUnread: false } : u
        ));

        setSelectedUser(user);
        try {
            const { data } = await api.get(`/chat/history/${user._id}`);
            setMessages(data);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching history", error);
        }
    };

    const sendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim() || !selectedUser || !userInfo) {
            if (!userInfo) alert('Admin not authenticated. Please login again.');
            return;
        }

        const messageData = {
            senderId: userInfo._id, // Use actual Admin ID
            receiverId: selectedUser._id,
            text: reply,
            isAdmin: true,
            createdAt: new Date().toISOString()
        };

        // We emit to socket, and socket saves to DB
        // But for consistency we can also use an API endpoint if we prefer
        // socket logic handles saving in our server.js
        socket.emit('send_message', messageData);

        // Optimistically add to UI
        setMessages((prev) => [...prev, messageData]);
        setReply("");
        scrollToBottom();
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    // Join support room and fetch users on mount
    useEffect(() => {
        socket.emit('join_support');
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ... (keep selectUser, sendReply, etc.)

    return (
        <div className="support-container">
            <div className="conversations-list">
                <h3>All Users</h3>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        marginBottom: '1rem',
                        width: '100%',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                    }}
                />

                {filteredUsers.length === 0 && <p style={{ padding: '1rem' }}>No users found.</p>}

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {filteredUsers.map(user => (
                        <div
                            key={user._id}
                            className={`conversation-item ${selectedUser?._id === user._id ? 'active' : ''}`}
                            onClick={() => selectUser(user)}
                        >
                            <div className="avatar"><FaUser /></div>
                            <div className="info">
                                <h4>
                                    {user.name}
                                    {user.hasUnread && <span style={{
                                        display: 'inline-block',
                                        width: '8px',
                                        height: '8px',
                                        backgroundColor: '#ef4444',
                                        borderRadius: '50%',
                                        marginLeft: '8px',
                                        verticalAlign: 'middle'
                                    }}></span>}
                                </h4>
                                <p>{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chat-area">
                {selectedUser ? (
                    <>
                        <div className="chat-header">
                            <h3>Chat with {selectedUser.name}</h3>
                        </div>
                        <div className="messages-display">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-bubble ${msg.isAdmin ? 'sent' : 'received'}`}>
                                    <p>{msg.text}</p>
                                    <span className="timestamp">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        <form className="chat-input-area" onSubmit={sendReply}>
                            <input
                                type="text"
                                placeholder="Type your reply..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                            />
                            <button type="submit"><FaPaperPlane /></button>
                        </form>
                    </>
                ) : (
                    <div className="no-chat-selected">
                        <p>Select a user to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Support;
