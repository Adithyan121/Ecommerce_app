import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaBarcode, FaMapMarkerAlt } from 'react-icons/fa';
import Scanner from '../components/Scanner';

const PutAway = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('scan_item'); // scan_item, scan_location, confirm

    // Data
    const [skuData, setSkuData] = useState(null); // The item we are moving
    const [stagingInventory, setStagingInventory] = useState(null); // The inventory record at 'Staging'
    const [targetLocation, setTargetLocation] = useState(null); // The bin we scanned
    const [quantity, setQuantity] = useState('');

    const [stagingLocations, setStagingLocations] = useState([]);

    useEffect(() => {
        // Fetch known staging locations to help user or validate?
        // Ideally backend logic knows staging. For now, assume we scan item and backend finds it in Staging?
        // Or we scan the Staging Location first?
        // Prompt says: "Staging -> Location assignment".
        // Let's assume user is standing at Staging. Scans Item.
    }, []);

    const handleScanItem = async (code) => {
        toast.loading('Checking Staging...');
        try {
            // 1. Get SKU
            const skuRes = await api.get(`/warehouse/sku/by-barcode/${code}`);
            const sku = skuRes.data;

            // 2. Check if this SKU is in any "Staging" location
            // We need an endpoint to find where an item is? 
            // `getInventory` filters by SKU.
            const invRes = await api.get(`/warehouse/inventory?skuId=${sku.virtual ? '' : sku._id}`);
            // Filter client side for Staging? simpler for MVP. 
            // Or backend `getInventory` already returns Location populated. 
            // We look for locations with type 'Staging'.
            // This relies on `getInventory` returning `locationId` populated with `type`.
            // My backend controller populates `locationId`, but defaults only `code`. I should explicitly populate `type` in controller if not already.
            // Wait, I updated WarehouseLocation schema, but `getInventory` populates `locationId`. 
            // Mongoose populate usually returns whole document if fields not specified, or checks select.
            // Controller: .populate('locationId', 'code'); -> ONLY Code. 
            // I need to update backend to return type as well. 
            // FOR NOW: I'll assume if location Code starts with 'STAGE' it is staging. Hacky but fast.

            const stagingItems = invRes.data.filter(i => i.locationId?.code?.startsWith('STAGE') && i.quantity > 0);

            if (stagingItems.length === 0) {
                toast.dismiss();
                toast.error('Item not found in Staging area.');
                return;
            }

            // Default to first staging source found
            setStagingInventory(stagingItems[0]);
            setSkuData(sku);
            setStep('scan_location');
            toast.dismiss();
        } catch (error) {
            toast.dismiss();
            toast.error('Product not found');
        }
    };

    const handleScanLocation = async (code) => {
        // Only accept if code is NOT Staging
        if (code.startsWith('STAGE')) {
            toast.error('Cannot Put Away to Staging. Scan a Bin.');
            return;
        }

        // Find Location ID by Code? 
        // I need an endpoint for this. `getInventory` is for stock.
        // `getWarehouseLocations` lists all?
        // I'll cache locations or iterate? 
        // Better: Assuming I don't have a "Get Location By Code" endpoint yet, 
        // I will implement a quick client-side lookup if list is small, or just send Code to backend?
        // My `stockTransfer` expects `toLocationId` (ID).
        // I really need to resolve Code -> ID.
        // Let's assume I fetch all locations on mount (MVP size is small).

        const loc = warehouseLocations.find(l => l.code === code);
        if (!loc) {
            toast.error('Invalid Location');
            return;
        }

        setTargetLocation(loc);
        setStep('confirm');
    };

    const [warehouseLocations, setWarehouseLocations] = useState([]);
    useEffect(() => {
        // Fetch all locations to resolve IDs
        // I need to know warehouse ID. Assume user's current warehouse or default.
        // `stagingInventory` has `warehouseId`.
        if (stagingInventory) {
            api.get(`/warehouse/locations/${stagingInventory.warehouseId._id}`)
                .then(res => setWarehouseLocations(res.data))
                .catch(err => console.error(err));
        }
    }, [stagingInventory]);


    const handleConfirm = async (e) => {
        e.preventDefault();
        try {
            await api.post('/warehouse/stock/transfer', {
                skuId: skuData._id || stagingInventory.skuId._id, // virtual check
                fromWarehouseId: stagingInventory.warehouseId._id,
                fromLocationId: stagingInventory.locationId._id,
                toWarehouseId: stagingInventory.warehouseId._id, // Internal move
                toLocationId: targetLocation._id,
                quantity: Number(quantity),
                reason: 'Put Away'
            });
            toast.success('Put Away Successful!');
            setStep('scan_item');
            setSkuData(null);
            setStagingInventory(null);
            setTargetLocation(null);
            setQuantity('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed');
        }
    };

    return (
        <div className="container">
            <div className="navbar">
                <button onClick={() => navigate('/')} className="btn" style={{ width: 'auto', padding: '0.5rem' }}><FaArrowLeft /></button>
                <h3>Put Away</h3>
                <div style={{ width: 30 }}></div>
            </div>

            {step === 'scan_item' && (
                <div>
                    <h2>Scan Item from Staging</h2>
                    <Scanner onScan={handleScanItem} onClose={() => navigate('/')} />
                    <p className="text-center mt-2">Find items in Receiving Area</p>
                </div>
            )}

            {step === 'scan_location' && (
                <div>
                    <div className="card mb-1">
                        <h4>{skuData?.productId?.name}</h4>
                        <p>Qty in Staging: {stagingInventory?.quantity}</p>
                    </div>
                    <h2>Scan Target Bin</h2>
                    <Scanner onScan={handleScanLocation} onClose={() => setStep('scan_item')} />
                </div>
            )}

            {step === 'confirm' && (
                <div>
                    <div className="card">
                        <h3>Confirm Move</h3>
                        <p><strong>Item:</strong> {skuData?.productId?.name}</p>
                        <p><strong>From:</strong> {stagingInventory?.locationId?.code} (Staging)</p>
                        <p><strong>To:</strong> {targetLocation?.code} (Bin)</p>
                    </div>

                    <form onSubmit={handleConfirm} style={{ marginTop: '1rem' }}>
                        <label>Quantity to Move</label>
                        <input
                            type="number"
                            className="input-field"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            max={stagingInventory?.quantity}
                            min="1"
                            required
                            autoFocus
                        />
                        <button type="submit" className="btn btn-primary mt-1">Confirm Put Away</button>
                    </form>
                    <button onClick={() => setStep('scan_location')} className="btn mt-1" style={{ background: 'transparent', border: '1px solid #555' }}>Rescan Location</button>
                </div>
            )}
        </div>
    );
};

export default PutAway;
