import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Lazy Load Pages
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const StockAction = lazy(() => import('./pages/StockAction'));
const Inventory = lazy(() => import('./pages/Inventory'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const PutAway = lazy(() => import('./pages/PutAway'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const ReceivePO = lazy(() => import('./pages/ReceivePO'));
const PickOrder = lazy(() => import('./pages/PickOrder'));

import OrderNotification from './components/OrderNotification';
import BottomNav from './components/BottomNav';

const Loading = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
    <div className="spinner" style={{
      width: '40px', height: '40px',
      border: '4px solid rgba(255, 255, 255, 0.3)',
      borderTop: '4px solid #fff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }}></div>
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
  </div>
);

function App() {
  return (
    <Router>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#333',
          color: '#fff',
        },
      }} />
      <OrderNotification />
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />

              {/* Parametrized Stock Actions */}
              <Route path="/stock/in" element={<StockAction type="in" />} />
              <Route path="/stock/out" element={<StockAction type="out" />} />
              <Route path="/stock/adjust" element={<StockAction type="adjust" />} />

              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/sku/:id" element={<ProductDetails />} />
              <Route path="/put-away" element={<PutAway />} />
              <Route path="/profile" element={<Profile />} />

              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/inbound/:id" element={<ReceivePO />} />
              <Route path="/orders/outbound/:id" element={<PickOrder />} />
            </Routes>
          </Suspense>
        </div>
        <BottomNav />
      </div>
    </Router>
  );
}

export default App;
