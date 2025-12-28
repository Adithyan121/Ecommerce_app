# 🚀 ShopWave E-Commerce Ecosystem

> **A comprehensive, full-stack E-commerce solution featuring a modern Customer Storefront, a powerful Admin Dashboard, and a specialized Warehouse Operations PWA.**

![MERN Stack](https://img.shields.io/badge/MERN-Stack-000000?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 🌟 Overview

**ShopWave** is not just a website; it's a complete ecosystem designed to handle real-world e-commerce scenarios. It bridges the gap between the customer's shopping experience, the administrator's management needs, and the warehouse staff's logistical challenges.

### 🏗️ Architecture

The project is a **Monorepo** containing four distinct applications:

1.  **Frontend (`/frontend`)**: The customer-facing shopping platform.
2.  **Admin Panel (`/admin`)**: The control center for business operations.
3.  **Warehouse Ops (`/warehouse_ops`)**: A mobile-first PWA for inventory and logistics staff.
4.  **Backend (`/backend`)**: The centralized API, Socket.io server, and database layer.

---

## 💻 Tech Stack

### **Frontend (Customer)**
*   **Core**: React 19 (Vite), React Router DOM 7
*   **Styling**: Pure CSS / CSS Modules
*   **State & API**: Context API, Axios
*   **Real-time**: Socket.IO Client (Chat Support)
*   **Payment**: **Razorpay Integration** (Trial Mode)
*   **UI/UX**: React Hot Toast, React Icons, Lazy Loading

### **Admin Dashboard**
*   **Core**: React 19 (Vite)
*   **Analytics**: Recharts (Data Visualization)
*   **Content**: React Markdown (CMS)
*   **Storage**: Firebase (Images/Assets - Optional)
*   **Features**: Real-time Notifications, Order Management

### **Warehouse Ops (PWA)**
*   **Type**: Progressive Web App (Vite PWA)
*   **Hardware Integration**: `@zxing/browser` (Barcode/QR Scanning)
*   **Functionality**: Mobile-optimized UI, Offline Capabilities (Basic)

### **Backend (API)**
*   **Runtime**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Auth**: JWT (JSON Web Tokens), Bcrypt
*   **Real-time**: Socket.IO Server
*   **Services**: 
    *   **PDFKit**: Dynamic Invoice Generation
    *   **Razorpay**: Payment Gateway Integration
    *   **Puppeteer**: Headless browser tasks
    *   **Compression**: Gzip/Brotli response compression

---

## ✨ Key Functionalities

### 🛍️ Frontend (Customer App)
*   **Authentication**: Secure Login/Register with JWT.
*   **Product Discovery**: Advanced Search, Filtering, and Categories.
*   **Shopping Experience**: Real-time Cart management, Wishlist.
*   **Payment Gateway**: Integrated **Razorpay** (Trial Mode) for secure transactions.
*   **Checkout**: Seamless checkout flow with Address Management.
*   **User Dashboard**: 
    *   Order History & Tracking.
    *   **Download PDF Invoices**.
*   **Support**: **Live Chat Widget** connecting directly to Admin support.

### ⚙️ Admin Panel
*   **Dashboard**: Comprehensive visual analytics for Sales, Orders, and Users.
*   **Live Chat Support**: Real-time interface to reply to customer chat queries.
*   **CMS (Content Management System)**: Manage dynamic pages and site content.
*   **User Management**: View user lists, and **Ban/Unban** suspicious accounts to restrict access.
*   **Design Studio**: **Live UI** to design and preview marketing Banners.
*   **Order Control**: Update statuses (Processed, Shipped, Delivered) with automated emails.
*   **Product Management**: Full CRUD for Products, Categories, and Attributes.
*   **Marketing**: Manage Coupons and Promotions.

### 📦 Warehouse Ops (Manage warehouse)
*   **Mobile-First Design**: Optimized for handheld devices (scanners/phones) for on-the-floor usage.
*   **Order Notifications**: Real-time alerts for staff when new orders are assigned.
*   **Stock Control**:
    *   **Stock In**: Receive inventory from Suppliers via POs.
    *   **Stock Out**: Record damages, internal usage, or transfers.
    *   **Stock Adjust**: Correct inventory discrepancies on the fly.
*   **Scan-to-Action**: Integrated camera scanner to read Barcodes/QRCodes for instant product lookup.
*   **Order Picking**: specialized interface for efficient order picking and packing.

---

## 🔗 Quick Links & Access

Use the following links to access the running applications:

| Application | URL | Description |
| :--- | :--- | :--- |
| **Frontend** | [https://ecommerce-app-five-kappa.vercel.app](https://ecommerce-app-five-kappa.vercel.app/) | Customer Storefront |
| **Admin Panel** | [https://ecommerce-app-y97t.vercel.app/](https://ecommerce-app-y97t.vercel.app/) | Management Dashboard |
| **Warehouse Ops** | [https://ecommerce-app-jv5f.vercel.app/](https://ecommerce-app-jv5f.vercel.app/) | Warehouse management app |


---

## 👥 User Roles & Priority

The system enforces strict role-based access control:

1.  **Super Admin** (Priority: High)
    *   **Access**: Admin Panel, Warehouse Ops, Frontend.
    *   **Permissions**: Full control over products, users, orders, and system settings. Can ban users and manage staff.
2.   **Admin** (Priority: High)
     *   **Access**: Admin Panel, Warehouse Ops, Frontend.
     *   **Permissions**: Full control over products, users, orders,    and system settings. Can ban users and manage staff.

3.  **Warehouse Staff** (Priority: Medium)
    *   **Access**: Warehouse Ops (PWA), Frontend.
    *   **Permissions**: Manage inventory, pick/pack orders, scan items. *Managed via Admin Panel.*

4.  **Customer / User** (Priority: Low)
    *   **Access**: Frontend.
    *   **Permissions**: Browse items, place orders, chat with support, manage own profile.

---

## 🔐 Test Credentials

Use these credentials to test the various roles and functionalities.
### **superadmin**
*   **Email**: `superadmin@gmail.com`
*   **Password**: `admin`

### **Admin**
*   **Email**: `admin@gmail.com`
*   **Password**: `admin`

### **Staff / Warehouse User**
*   **Email**: `staff@gmail.com`
*   **Password**: `1234`

### **Standard User**
*   **Email**: `user@gmail.com`
*   **Password**: `1234`
*or create a new user*

### **Banned User** (To test security)
*   **Email**: `banned_user@gmail.com`
*   **Password**: `1234`

---

## 🛠️ How to Run

1.  **Backend**
    ```bash
    cd backend
    npm install
    npm start
    ```

2.  **Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

3.  **Admin Panel**
    ```bash
    cd admin
    npm install
    npm run dev
    ```

4.  **Warehouse Ops**
    ```bash
    cd warehouse_ops
    npm install
    npm run dev
    ```

---
*Built with ❤️ by Adithyan G.*
