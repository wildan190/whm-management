import express from 'express';
import { auth } from '../middleware/auth.js';
import Item from '../models/Item.js';
import Location from '../models/Location.js';
import Stock from '../models/Stock.js';
import Transaction from '../models/Transaction.js';

const router = express.Router();
router.use(auth);

// Inbound Process
router.post('/inbound', async (req, res) => {
  try {
    const { items, startTime } = req.body;
    const transactionItems = [];

    for (const itemData of items) {
      const item = await Item.findOne({ sku: itemData.sku });
      const location = await Location.findOne({ name: itemData.locationName });

      if (!item || !location) {
        return res.status(404).json({ message: `Item (${itemData.sku}) or Location (${itemData.locationName}) not found` });
      }

      // Update Stock
      let stock = await Stock.findOne({ 
        item: item._id, 
        location: location._id,
        batchNumber: itemData.batchNumber,
        expiryDate: itemData.expiryDate 
      });

      if (stock) {
        stock.quantity += itemData.quantity;
      } else {
        stock = new Stock({ 
          item: item._id, 
          location: location._id, 
          quantity: itemData.quantity,
          batchNumber: itemData.batchNumber,
          expiryDate: itemData.expiryDate,
          status: itemData.status || 'AVAILABLE'
        });
      }
      await stock.save();

      transactionItems.push({
        item: item._id,
        quantity: itemData.quantity,
        location: location._id
      });
    }

    const duration = startTime ? Math.floor((new Date() - new Date(startTime)) / 1000) : 0;

    const transaction = new Transaction({
      type: 'INBOUND',
      items: transactionItems,
      user: req.user.id,
      startTime: startTime || new Date(),
      duration: duration
    });
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Outbound Process
router.post('/outbound', async (req, res) => {
  try {
    const { items, notes, shipping, startTime } = req.body;
    const transactionItems = [];

    for (const itemData of items) {
      const item = await Item.findOne({ sku: itemData.sku });
      const location = await Location.findOne({ name: itemData.locationName });

      if (!item || !location) {
        return res.status(404).json({ message: `Item (${itemData.sku}) or Location (${itemData.locationName}) not found` });
      }

      // Find stock using FEFO (First Expired First Out)
      let availableStocks = await Stock.find({ 
        item: item._id, 
        status: 'AVAILABLE',
        quantity: { $gt: 0 }
      }).populate('location').sort({ expiryDate: 1 }); // Sort by expiry date ascending

      let remainingToPick = itemData.quantity;
      
      for (const stock of availableStocks) {
        if (remainingToPick <= 0) break;
        
        const pickAmount = Math.min(stock.quantity, remainingToPick);
        stock.quantity -= pickAmount;
        await stock.save();
        
        transactionItems.push({
          item: item._id,
          quantity: pickAmount,
          location: stock.location._id
        });
        
        remainingToPick -= pickAmount;
      }

      if (remainingToPick > 0) {
        return res.status(400).json({ message: `Insufficient stock for ${itemData.sku}. Missing ${remainingToPick} units.` });
      }
    }

    const duration = startTime ? Math.floor((new Date() - new Date(startTime)) / 1000) : 0;

    const transaction = new Transaction({
      type: 'OUTBOUND',
      items: transactionItems,
      user: req.user.id,
      startTime: startTime || new Date(),
      duration: duration
    });
    await transaction.save();

    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  const transactions = await Transaction.find().populate('items.item').populate('items.location').populate('user');
  res.json(transactions);
});

export default router;
