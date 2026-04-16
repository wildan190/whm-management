import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Stock from '../models/Stock.js';

const router = express.Router();
router.use(auth);

// Mock ERP/POS Sync
router.post('/sync-erp', adminOnly, async (req, res) => {
  // Simulate fetching orders from ERP
  const mockOrders = [
    { orderId: 'ERP-999', sku: 'SKU-001', quantity: 50 },
    { orderId: 'ERP-888', sku: 'SKU-005', quantity: 120 }
  ];
  
  res.json({ 
    message: 'Sinkronisasi ERP Berhasil', 
    syncedOrders: mockOrders.length,
    timestamp: new Date()
  });
});

// Cross-Docking Check
// This logic finds if incoming items can be directly shipped
router.get('/cross-dock-check', async (req, res) => {
  try {
    const { sku, quantity } = req.query;
    
    // Simulate finding a waiting outbound order for this SKU
    const waitingOrders = [
      { orderId: 'WAIT-001', sku: 'SKU-001', required: 100, priority: 'HIGH' }
    ];
    
    const matched = waitingOrders.find(o => o.sku === sku);
    
    if (matched) {
      res.json({
        canCrossDock: true,
        instruction: `Barang ${sku} bisa langsung dikirim ke area Cross-Dock untuk Order ${matched.orderId}`,
        priority: matched.priority
      });
    } else {
      res.json({ canCrossDock: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
