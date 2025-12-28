import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import './App.css';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const Customers = lazy(() => import('./pages/Customers'));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails'));
const Categories = lazy(() => import('./pages/Categories'));
const Settings = lazy(() => import('./pages/Settings'));
const Shipping = lazy(() => import('./pages/Shipping'));
const Inventory = lazy(() => import('./pages/Inventory'));
const WarehouseManagement = lazy(() => import('./pages/WarehouseManagement'));
const Marketing = lazy(() => import('./pages/Marketing'));
const CMS = lazy(() => import('./pages/CMS'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Support = lazy(() => import('./pages/Support'));
const Login = lazy(() => import('./pages/Login'));
const Profile = lazy(() => import('./pages/Profile'));
const Banners = lazy(() => import('./pages/Banners'));

const Loading = () => <div className="p-4 text-center">Loading...</div>;

const MainLayout = () => {
  return (
    <div className="App">
      <Sidebar />
      <div className="content-wrapper">
        <Navbar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={
            <Suspense fallback={<Loading />}>
              <Login />
            </Suspense>
          } />

          <Route element={<MainLayout />}>
            <Route path="/" element={
              <Suspense fallback={<Loading />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/products" element={
              <Suspense fallback={<Loading />}>
                <Products />
              </Suspense>
            } />
            <Route path="/add-product" element={
              <Suspense fallback={<Loading />}>
                <AddProduct />
              </Suspense>
            } />
            <Route path="/product/:id/edit" element={
              <Suspense fallback={<Loading />}>
                <AddProduct />
              </Suspense>
            } />
            <Route path="/categories" element={
              <Suspense fallback={<Loading />}>
                <Categories />
              </Suspense>
            } />
            <Route path="/orders" element={
              <Suspense fallback={<Loading />}>
                <Orders />
              </Suspense>
            } />
            <Route path="/orders/:id" element={
              <Suspense fallback={<Loading />}>
                <OrderDetails />
              </Suspense>
            } />
            <Route path="/customers" element={
              <Suspense fallback={<Loading />}>
                <Customers />
              </Suspense>
            } />
            <Route path="/customers/:id" element={
              <Suspense fallback={<Loading />}>
                <CustomerDetails />
              </Suspense>
            } />
            <Route path="/settings" element={
              <Suspense fallback={<Loading />}>
                <Settings />
              </Suspense>
            } />
            <Route path="/shipping" element={
              <Suspense fallback={<Loading />}>
                <Shipping />
              </Suspense>
            } />
            <Route path="/inventory" element={
              <Suspense fallback={<Loading />}>
                <Inventory />
              </Suspense>
            } />
            <Route path="/warehouse" element={
              <Suspense fallback={<Loading />}>
                <WarehouseManagement />
              </Suspense>
            } />
            <Route path="/marketing" element={
              <Suspense fallback={<Loading />}>
                <Marketing />
              </Suspense>
            } />
            <Route path="/cms" element={
              <Suspense fallback={<Loading />}>
                <CMS />
              </Suspense>
            } />
            <Route path="/reviews" element={
              <Suspense fallback={<Loading />}>
                <Reviews />
              </Suspense>
            } />
            <Route path="/coupons" element={
              <Suspense fallback={<Loading />}>
                <Coupons />
              </Suspense>
            } />
            <Route path="/analytics" element={
              <Suspense fallback={<Loading />}>
                <Analytics />
              </Suspense>
            } />
            <Route path="/notifications" element={
              <Suspense fallback={<Loading />}>
                <Notifications />
              </Suspense>
            } />
            <Route path="/support" element={
              <Suspense fallback={<Loading />}>
                <Support />
              </Suspense>
            } />
            <Route path="/profile" element={
              <Suspense fallback={<Loading />}>
                <Profile />
              </Suspense>
            } />
            <Route path="/banners" element={
              <Suspense fallback={<Loading />}>
                <Banners />
              </Suspense>
            } />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
