const express = require('express');
const router = express.Router();
const {
    getSkuByBarcode,
    stockIn,
    stockOut,
    stockAdjust,
    stockTransfer,
    getInventory,
    getWarehouses,
    createWarehouse,
    getWarehouseLocations,
    getInboundPOs,
    getPOById,
    receivePOItem,
    getOutboundOrders,
    getOutboundOrderDetails,
    assignOrder
} = require('../controllers/warehouseController');
const { protect, admin, staff } = require('../middleware/authMiddleware');

// Base route: /api/warehouse

// Authorize Staff for Operations
router.get('/sku/by-barcode/:barcode', protect, staff, getSkuByBarcode);
router.post('/stock/in', protect, staff, stockIn);
router.post('/stock/out', protect, staff, stockOut);
router.post('/stock/transfer', protect, staff, stockTransfer);
router.post('/stock/adjust', protect, staff, stockAdjust);
// Inbound
router.get('/inbound/po', protect, staff, getInboundPOs);
router.get('/inbound/po/:id', protect, staff, getPOById);
router.post('/inbound/receive', protect, staff, receivePOItem);

// Outbound
router.get('/outbound/orders', protect, staff, getOutboundOrders);
router.get('/outbound/orders/:id', protect, staff, getOutboundOrderDetails);
router.put('/orders/:id/assign', protect, staff, assignOrder);

router.get('/inventory', protect, staff, getInventory);
router.get('/sku/:id', protect, staff, require('../controllers/warehouseController').getSKUDetails);

router.route('/')
    .get(protect, staff, getWarehouses)
    .post(protect, admin, createWarehouse);

router.get('/locations/:warehouseId', protect, staff, getWarehouseLocations);

module.exports = router;
