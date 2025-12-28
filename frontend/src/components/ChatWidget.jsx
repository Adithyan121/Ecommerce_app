import React, { useState, useEffect, useRef, useContext } from 'react';
import io from 'socket.io-client';
import api, { SOCKET_URL } from '../api';
import { AuthContext } from '../context/AuthContext';
import { FaCommentDots, FaPaperPlane, FaTimes } from 'react-icons/fa';
import './ChatWidget.css';

const socket = io.connect(SOCKET_URL);

const ChatWidget = () => {
    const { user } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (user) {
            socket.emit('join_room', user._id);
            fetchHistory();

            socket.on('receive_message', (data) => {
                setChatHistory((prev) => [...prev, data]);
                scrollToBottom();
                if (!isOpen && data.isAdmin) {
                    setUnreadCount(prev => prev + 1);
                }
            });

            // Listen for openChat event
            const handleOpenChat = () => {
                setIsOpen(true);
                setUnreadCount(0);
            };
            window.addEventListener('openChat', handleOpenChat);

            return () => {
                socket.off('receive_message');
                window.removeEventListener('openChat', handleOpenChat);
            };
        }
    }, [user, isOpen]);

    const fetchHistory = async () => {
        if (!user) return;
        try {
            const { data } = await api.get(`/chat/history/${user._id}`);
            setChatHistory(data);
            scrollToBottom();
        } catch (error) {
            console.error("Error fetching chat history", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() === "" || !user) return;

        const messageData = {
            senderId: user._id,
            senderName: user.name, // Added for notifications
            receiverId: null, // To support
            text: message,
            isAdmin: false,
            createdAt: new Date().toISOString() // Optimistic update
        };

        await socket.emit('send_message', messageData);
        setChatHistory((prev) => [...prev, messageData]);
        setMessage("");
        scrollToBottom();
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
        }
    };

    if (!user) return null; // Don't show if not logged in

    return (
        <div className="chat-widget-container">
            {isOpen ? (
                <div className="chat-window">
                    <div className="chat-header">
                        <h4>Support Chat</h4>
                        <button onClick={() => setIsOpen(false)}><FaTimes /></button>
                    </div>
                    <div className="chat-body">
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`message-bubble ${msg.isAdmin ? 'received' : 'sent'}`}>
                                <p>{msg.text}</p>
                                <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="chat-footer" onSubmit={sendMessage}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit"><FaPaperPlane /></button>
                    </form>
                </div>
            ) : (
                <button className="chat-toggle-btn" onClick={toggleChat}>
                    <FaCommentDots /> Support
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
