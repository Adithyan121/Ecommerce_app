import React, { createContext, useState, useEffect, useContext } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        if (user && user.token) {
            fetchWishlist();
        } else {
            setWishlist([]);
        }
    }, [user]);

    const fetchWishlist = async () => {
        if (!user || !user.token) return;
        try {
            const { data } = await api.get('/wishlist');
            setWishlist(data);
        } catch (error) {
            console.error("Error fetching wishlist", error);
        }
    };

    const addToWishlist = async (product) => {
        if (!user || !user.token) {
            toast.error("Please login to add to wishlist");
            return;
        }
        try {
            const { data } = await api.post(`/wishlist/${product._id}`, {});
            setWishlist(data);
            toast.success("Added to wishlist");
        } catch (error) {
            console.error("Error adding to wishlist", error);
            toast.error(error.response?.data?.message || "Error adding to wishlist");
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!user || !user.token) return;
        try {
            const { data } = await api.delete(`/wishlist/${productId}`);
            setWishlist(data);
        } catch (error) {
            console.error("Error removing from wishlist", error);
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
