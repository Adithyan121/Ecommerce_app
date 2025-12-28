import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Banned = lazy(() => import('./pages/Banned'));
const Page = lazy(() => import('./pages/Page'));
const Invoice = lazy(() => import('./pages/Invoice'));

import { Toaster } from 'react-hot-toast';
import './App.css';

// Simple Loading Component
const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <div className="loader"></div>
  </div>
);

function App() {
  useEffect(() => {
    // Setup logic if needed
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <Router>
              <div className="App">
                <Navbar />

                <div className="main-content">
                  <Suspense fallback={<Loading />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/search/:keyword" element={<Home />} />
                      <Route path="/category/:categorySlug" element={<Home />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/order/:id" element={<OrderDetails />} />
                      <Route path="/banned" element={<Banned />} />
                      <Route path="/invoice/:id" element={<Invoice />} />

                      {/* Dynamic CMS Routes */}
                      <Route path="/page/:slug" element={<Page />} />
                    </Routes>
                  </Suspense>
                </div>

                <Footer />
                <ChatWidget />
              </div>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}



export default App;
