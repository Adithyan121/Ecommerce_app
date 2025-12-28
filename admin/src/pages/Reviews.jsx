import React, { useEffect, useState } from 'react';
import api from '../api';
import { FaStar, FaTrash } from 'react-icons/fa';
import './Products.css';

const Reviews = () => {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get('/reviews');
            setReviews(data);
        } catch (error) {
            console.error("Error fetching reviews", error);
        }
    };

    const deleteReview = async (id) => {
        if (window.confirm('Delete this review?')) {
            try {
                await api.delete(`/reviews/${id}`);
                fetchReviews();
            } catch (error) {
                console.error("Error deleting review", error);
            }
        }
    };

    return (
        <div className="container">
            <div className="products-header">
                <h1>Product Reviews</h1>
            </div>
            <div className="card">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>User</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reviews.map(review => (
                            <tr key={review._id}>
                                <td>{review.product?.name || 'Unknown Product'}</td>
                                <td>{review.user?.name || 'Unknown User'}</td>
                                <td>
                                    <div style={{ display: 'flex', color: '#ffc107' }}>
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} />
                                        ))}
                                    </div>
                                </td>
                                <td>{review.comment}</td>
                                <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-icon delete" onClick={() => deleteReview(review._id)}><FaTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Reviews;
