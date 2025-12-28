const mongoose = require('mongoose');
const SKU = require('../models/SKU');
const Warehouse = require('../models/Warehouse');
const WarehouseLocation = require('../models/WarehouseLocation');
const Inventory = require('../models/Inventory');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const PurchaseOrder = require('../models/PurchaseOrder');
const Order = require('../models/Order');

// @desc    Get SKU by Barcode
// @route   GET /api/warehouse/sku/by-barcode/:barcode
// @access  Private (Warehouse Staff/Manager)
const getSkuByBarcode = async (req, res) => {
    try {
        const { barcode } = req.params;

        let sku = await SKU.findOne({ barcode }).populate('productId', 'name description image category');

        if (!sku) {
            // Fallback: Check Product collection directly if SKU not found? 
            // This aids migration or simple setups.
            const product = await Product.findOne({ barcode });
            if (product) {
                // Return a clear structure, maybe a "virtual" SKU
                return res.json({
                    _id: null, // No SKU ID yet
                    sku: product.sku || product._id,
                    barcode: product.barcode,
                    productId: product,
                    attributes: {},
                    virtual: true // Flag to tell frontend this isn't a real SKU record yet
                });
            }
            return res.status(404).json({ message: 'SKU not found' });
        }

        res.json(sku);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Stock In (Receiving)
// @route   POST /api/warehouse/stock/in
// @access  Private (Warehouse Staff/Manager)
const stockIn = async (req, res) => {
    let { skuId, barcode, productId, warehouseId, locationId, quantity, reason } = req.body;

    try {
        // Lazy SKU Creation
        if (!skuId && barcode && productId) {
            let sku = await SKU.findOne({ barcode });
            if (!sku) {
                sku = await SKU.create({
                    sku: barcode, // Simplification
                    barcode,
                    productId
                });
            }
            skuId = sku._id;
        }

        // Simple validation
        if (!skuId || !warehouseId || !quantity) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        // 1. Check if SKU and Warehouse exist
        // (Skipping strict existence checks for speed, assuming IDs are valid from frontend selectors)

        // 2. Find or Create Inventory
        let inventory = await Inventory.findOne({ skuId, warehouseId, locationId: locationId || null });

        if (inventory) {
            inventory.quantity += Number(quantity);
        } else {
            inventory = new Inventory({
                skuId,
                warehouseId,
                locationId: locationId || null,
                quantity: Number(quantity),
                reserved: 0
            });
        }
        await inventory.save();

        // 3. Log Movement
        await StockMovement.create({
            skuId,
            warehouseId,
            locationId: locationId || null,
            type: 'IN',
            quantity: Number(quantity),
            reason,
            scannedBy: req.user._id,
            createdAt: new Date()
        });

        // Sync Product Model
        await updateProductStock(skuId);

        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Stock Out (Picking/Shipping)
// @route   POST /api/warehouse/stock/out
// @access  Private (Warehouse Staff/Manager)
const stockOut = async (req, res) => {
    const { skuId, warehouseId, locationId, quantity, reason, referenceId } = req.body;

    if (!skuId || !warehouseId || !quantity) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    try {
        let inventory = await Inventory.findOne({ skuId, warehouseId, locationId: locationId || null });

        if (!inventory) {
            return res.status(404).json({ message: 'Inventory record not found' });
        }

        if (inventory.quantity < quantity) {
            return res.status(400).json({ message: 'Insufficient stock' });
        }

        inventory.quantity -= Number(quantity);

        // If this is an order fulfillment (implied by referenceId), release the reservation
        // We assume the reservation was made on this inventory record or we are just clearing global debt.
        // For strict correctness, we should check if reserved > 0.
        if (referenceId && inventory.reserved >= Number(quantity)) {
            inventory.reserved -= Number(quantity);
        }

        await inventory.save();

        await StockMovement.create({
            skuId,
            warehouseId,
            locationId: locationId || null,
            type: 'OUT',
            quantity: Number(quantity),
            reason,
            referenceId,
            scannedBy: req.user._id
        });

        // Sync Product Model
        await updateProductStock(skuId);

        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Stock Adjustment
// @route   POST /api/warehouse/stock/adjust
// @access  Private (Warehouse Manager)
const stockAdjust = async (req, res) => {
    const { skuId, warehouseId, locationId, quantity, reason } = req.body;
    // Quantity here refers to the DELTA (e.g. +5 or -2)

    if (!skuId || !warehouseId || quantity === undefined) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const val = Number(quantity);
    if (val === 0) return res.status(200).json({ message: 'No change' });

    try {
        let inventory = await Inventory.findOne({ skuId, warehouseId, locationId: locationId || null });

        if (!inventory) {
            // If adjusting positive, we might create it. If negative, error.
            if (val > 0) {
                inventory = new Inventory({
                    skuId,
                    warehouseId,
                    locationId: locationId || null,
                    quantity: 0
                });
            } else {
                return res.status(404).json({ message: 'Inventory record not found to deduct from' });
            }
        }

        if (inventory.quantity + val < 0) {
            return res.status(400).json({ message: 'Adjustment would result in negative stock' });
        }

        inventory.quantity += val;
        await inventory.save();

        await StockMovement.create({
            skuId,
            warehouseId,
            locationId: locationId || null,
            type: 'ADJUST',
            quantity: val, // Keep signed
            reason,
            scannedBy: req.user._id
        });

        // Sync Product Model
        await updateProductStock(skuId);

        res.status(200).json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Inventory with Filters
// @route   GET /api/warehouse/inventory
// @access  Private
const getInventory = async (req, res) => {
    try {
        const { warehouseId, skuId, search, lowStock, reserved, locationId } = req.query;
        let query = {};

        if (warehouseId) query.warehouseId = warehouseId;
        if (locationId) query.locationId = locationId;
        if (skuId) query.skuId = skuId;

        // Reserved Filter
        if (reserved === 'true') {
            query.reserved = { $gt: 0 };
        }

        // Search Filter (SKU, Name, Barcode)
        if (search) {
            const searchRegex = new RegExp(search, 'i');

            // Find products matching name
            const products = await Product.find({ name: searchRegex }).select('_id');
            const productIds = products.map(p => p._id);

            // Find SKUs matching code, barcode, or productId
            const skus = await SKU.find({
                $or: [
                    { sku: searchRegex },
                    { barcode: searchRegex },
                    { productId: { $in: productIds } }
                ]
            }).select('_id');

            const foundSkuIds = skus.map(s => s._id);

            // Constrain Inventory Query
            if (query.skuId) {
                // If skuId was already set, intersect (shouldn't happen often)
                // Let's just overwrite or $in if multiple
                query.skuId = { $in: foundSkuIds.filter(id => id.toString() === query.skuId) };
            } else {
                query.skuId = { $in: foundSkuIds };
            }
        }

        // Low Stock Filter
        // Strategy: Find SKUs where total stock (from Product cache) <= minimumStockLevel
        // Then filter inventory by those SKU IDs.
        if (lowStock === 'true') {
            // Fetch all SKUs (or searched ones)
            // This is heavy if no search is applied, but necessary for accurate "Low Stock" view
            // Optimization: Only fetch IDs and minStock.
            const skuValQuery = {};
            if (query.skuId) skuValQuery._id = query.skuId;

            // We need to look up Product stock. 
            // Better: SKU stores minStock. Product stores total stock.
            // We need to join.
            // Let's use Aggregation for "Get all Low Stock SKUs"
            const lowStockSkus = await SKU.aggregate([
                { $match: skuValQuery },
                {
                    $lookup: {
                        from: 'products',
                        localField: 'productId',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                { $unwind: '$product' },
                {
                    $match: {
                        $expr: { $lte: ['$product.stock', '$minimumStockLevel'] }
                    }
                },
                { $project: { _id: 1 } }
            ]);

            const lowStockIds = lowStockSkus.map(s => s._id);
            if (query.skuId) {
                // Intersect
                // query.skuId is currently $in [...] or string. 
                // Let's simplify: Just set query.skuId to intersection
                // But MongoDB query merging is complex in JS.
                // Assuming simple $in:
                // We'll just set it to the lowStockIds, but we must ensure we don't broaden the search.
                // If search was active, we intersect foundSkuIds and lowStockIds
                if (search) {
                    // handled implicitly by earlier SKU find? No, that returned IDs match text. 
                    // We need IDs that match text AND are low stock.
                    // It's getting complex. Let's start with lowStockIds and filter via Search if needed.
                    // Easier: Just add to the $in clause.
                    // If query.skuId exists (from search), we filter it.
                    const existingIds = query.skuId.$in || [query.skuId]; // simplify
                    const intersection = existingIds.filter(id => lowStockIds.some(lid => lid.equals(id)));
                    query.skuId = { $in: intersection };
                } else {
                    query.skuId = { $in: lowStockIds };
                }
            } else {
                query.skuId = { $in: lowStockIds };
            }
        }

        const inventory = await Inventory.find(query)
            .populate({
                path: 'skuId',
                populate: { path: 'productId', select: 'name image sku' }
            })
            .populate('warehouseId', 'name')
            .populate('locationId', 'code');

        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Detailed SKU View (Aggregate across locations)
// @route   GET /api/warehouse/sku/:id
// @access  Private
const getSKUDetails = async (req, res) => {
    try {
        const { id } = req.params; // SKU ID (or Inventory ID? Request says "Inventory Details", usually implied Product/SKU)

        // Check if ID is Inventory ID or SKU ID. 
        // Let's assume SKU ID for this route `sku/:id`.
        // If Frontend passes Inventory ID, it should use a different route or we resolve it.
        // We will assume SKU ID.

        const sku = await SKU.findById(id).populate('productId');
        if (!sku) return res.status(404).json({ message: 'SKU not found' });

        // Get all inventory entries for this SKU
        const inventory = await Inventory.find({ skuId: id })
            .populate('warehouseId', 'name')
            .populate('locationId', 'code');

        const totalQuantity = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
        const totalReserved = inventory.reduce((acc, curr) => acc + curr.reserved, 0);

        // Recent Movements
        const movements = await StockMovement.find({ skuId: id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('warehouseId', 'name')
            .populate('locationId', 'code')
            .populate('scannedBy', 'name');

        res.json({
            sku,
            inventory, // Locations holding the SKU
            stats: {
                totalQuantity,
                totalReserved,
                available: totalQuantity - totalReserved
            },
            movements
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Warehouses
// @route   GET /api/warehouse
// @access  Private
const getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ isActive: true });
        res.json(warehouses);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Create Warehouse
// @route   POST /api/warehouse
// @access  Private (Admin)
const createWarehouse = async (req, res) => {
    try {
        const { name, code, address } = req.body;
        const wh = await Warehouse.create({ name, code, address });
        res.status(201).json(wh);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper to sync legacy Product stock with Warehouse Inventory
const updateProductStock = async (skuId) => {
    try {
        const sku = await SKU.findById(skuId);
        if (!sku) return;

        const inventories = await Inventory.find({ skuId });
        const totalQty = inventories.reduce((acc, curr) => acc + curr.quantity, 0);

        await Product.findByIdAndUpdate(sku.productId, {
            countInStock: totalQty,
            stock: totalQty // Updating both legacy fields
        });
    } catch (error) {
        console.error("Error syncing product stock:", error);
    }
};

// @desc    Stock Transfer (Warehouse to Warehouse or Bin to Bin)
// @route   POST /api/warehouse/stock/transfer
// @access  Private (Warehouse Staff/Manager)
const stockTransfer = async (req, res) => {
    const { skuId, fromWarehouseId, fromLocationId, toWarehouseId, toLocationId, quantity, reason } = req.body;

    if (!skuId || !fromWarehouseId || !toWarehouseId || !quantity) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const qty = Number(quantity);

        // 1. Deduct from Source
        let sourceInventory = await Inventory.findOne({
            skuId,
            warehouseId: fromWarehouseId,
            locationId: fromLocationId || null
        }).session(session);

        if (!sourceInventory || sourceInventory.quantity < qty) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Insufficient stock at source' });
        }

        sourceInventory.quantity -= qty;
        await sourceInventory.save({ session });

        // 2. Add to Destination
        let destInventory = await Inventory.findOne({
            skuId,
            warehouseId: toWarehouseId,
            locationId: toLocationId || null
        }).session(session);

        if (destInventory) {
            destInventory.quantity += qty;
        } else {
            destInventory = new Inventory({
                skuId,
                warehouseId: toWarehouseId,
                locationId: toLocationId || null,
                quantity: qty,
                reserved: 0
            });
        }
        await destInventory.save({ session });

        // 3. Log Movements (Two entries: Out from Source, In to Dest)
        await StockMovement.create([{
            skuId,
            warehouseId: fromWarehouseId,
            locationId: fromLocationId || null,
            type: 'TRANSFER',
            quantity: -qty,
            reason: reason || 'Internal Transfer Out',
            sourceType: 'Transfer',
            scannedBy: req.user._id,
        }, {
            skuId,
            warehouseId: toWarehouseId,
            locationId: toLocationId || null,
            type: 'TRANSFER',
            quantity: qty,
            reason: reason || 'Internal Transfer In',
            sourceType: 'Transfer',
            scannedBy: req.user._id,
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Sync Product Model (Total stock might not change, but good to be safe)
        await updateProductStock(skuId);

        res.status(200).json({ message: 'Transfer successful' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: 'Transfer failed' });
    }
};

// @desc    Get Warehouse Locations
// @route   GET /api/warehouse/locations/:warehouseId
// @access  Private (Staff)
const getWarehouseLocations = async (req, res) => {
    try {
        // Allow filtering by type (e.g. ?type=Staging)
        const filter = { warehouseId: req.params.warehouseId };
        if (req.query.type) filter.type = req.query.type;

        const locations = await WarehouseLocation.find(filter);
        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



// @desc    Get Open Purchase Orders
// @route   GET /api/warehouse/inbound/po
// @access  Private
const getInboundPOs = async (req, res) => {
    try {
        const pos = await PurchaseOrder.find({
            status: { $ne: 'Received' }
        }).populate('supplier', 'name'); // Assuming simple string or related model
        res.json(pos);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get PO Details
// @route   GET /api/warehouse/inbound/po/:id
// @access  Private
const getPOById = async (req, res) => {
    try {
        const po = await PurchaseOrder.findById(req.params.id)
            .populate({
                path: 'items.skuId',
                populate: { path: 'productId', select: 'name image sku' }
            });
        if (!po) return res.status(404).json({ message: 'PO not found' });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Receive PO Item
// @route   POST /api/warehouse/inbound/receive
// @access  Private
const receivePOItem = async (req, res) => {
    const { poId, skuId, quantity, locationId, warehouseId } = req.body;

    // Use transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const po = await PurchaseOrder.findById(poId).session(session);
        if (!po) throw new Error('PO not found');

        const item = po.items.find(i => i.skuId.toString() === skuId);
        if (!item) throw new Error('Item not in PO');

        // Update PO
        item.quantityReceived += Number(quantity);

        // Check if PO is fully received
        const allReceived = po.items.every(i => i.quantityReceived >= i.quantityExpected);
        if (allReceived) po.status = 'Received';
        else po.status = 'Partially Received';

        await po.save({ session });

        // Update Inventory (Reuse logic or direct update)
        // We'll mimic stockIn logic effectively here
        let inventory = await Inventory.findOne({ skuId, warehouseId, locationId: locationId || null }).session(session);
        if (inventory) {
            inventory.quantity += Number(quantity);
        } else {
            inventory = new Inventory({
                skuId,
                warehouseId,
                locationId: locationId || null,
                quantity: Number(quantity),
                reserved: 0
            });
        }
        await inventory.save({ session });

        // Log Movement
        await StockMovement.create([{
            skuId,
            warehouseId,
            locationId: locationId || null,
            type: 'IN',
            quantity: Number(quantity),
            reason: `PO Receipt ${po.poNumber}`,
            sourceType: 'Purchase Order',
            sourceId: po._id,
            scannedBy: req.user._id
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // Sync Product Model
        await updateProductStock(skuId);

        res.json({ message: 'Received Successfully', po });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);
        res.status(500).json({ message: error.message || 'Receive Failed' });
    }
};

// --- Outbound (Orders) ---

// @desc    Get Orders Ready for Picking
// @route   GET /api/warehouse/outbound/orders
// @access  Private
const getOutboundOrders = async (req, res) => {
    try {
        // Find Paid orders (or COD) that are ready to process
        const orders = await Order.find({
            $or: [
                { isPaid: true },
                { paymentMethod: 'COD' }
            ],
            orderStatus: { $in: ['Pending', 'Processing'] },
            pickStatus: { $ne: 'Shipped' }
        })
            .select('_id user createdAt itemsPrice totalPrice orderStatus pickStatus assignedTo')
            .populate('user', 'name')
            .sort({ createdAt: -1 }); // Newest first

        res.json(orders);
    } catch (error) {
        console.error("Error fetching outbound orders:", error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Order Picking Details
// @route   GET /api/warehouse/outbound/orders/:id
// @access  Private
const getOutboundOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('orderItems.product', 'name image sku barcode');

        // We also need location suggestions for these items.
        // For each item, find where it is currently stored.
        // This is complex for a simple GET. Ideally, we just return order, 
        // and frontend fetches "Best Location" for each SKU individually or we aggregate here.
        // Let's aggregate for MVP UX.

        const itemsWithLocations = await Promise.all(order.orderItems.map(async (item) => {
            // Find SKU for this product
            // Assumption: Product has 1 SKU or we match by ProductId
            // Models/Order stores `product` (ObjectId) and `sku` (String code).
            // Let's find SKU ID first.
            let sku = null;
            if (item.sku) {
                sku = await SKU.findOne({ sku: item.sku });
            }
            if (!sku) {
                sku = await SKU.findOne({ productId: item.product._id });
            }

            let locations = [];
            if (sku) {
                const inv = await Inventory.find({ skuId: sku._id, quantity: { $gt: 0 } })
                    .populate('locationId', 'code type zone');
                locations = inv.map(i => ({
                    code: i.locationId?.code || 'Unknown',
                    qty: i.quantity,
                    locationId: i.locationId?._id
                }));
            }

            return {
                ...item.toObject(),
                skuId: sku?._id,
                availableLocations: locations
            };
        }));

        // Return modified structure or just append logic
        res.json({ ...order.toObject(), orderItems: itemsWithLocations });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};


// @desc    Assign Order to Staff
// @route   PUT /api/warehouse/orders/:id/assign
// @access  Private
const assignOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.assignedTo = req.user._id;
            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getSkuByBarcode,
    stockIn,
    stockOut,
    stockAdjust,
    stockTransfer,
    getInventory,
    getWarehouses,
    createWarehouse,
    getWarehouseLocations,
    updateProductStock,

    // New
    getInboundPOs,
    getPOById,
    receivePOItem,
    getOutboundOrders,
    getOutboundOrderDetails,
    assignOrder,
    getSKUDetails
};
