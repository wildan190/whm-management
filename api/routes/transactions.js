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
    const { items } = req.body; // Array of { sku, locationName, quantity }
    const transactionItems = [];

    for (const itemData of items) {
      const item = await Item.findOne({ sku: itemData.sku });
      const location = await Location.findOne({ name: itemData.locationName });

      if (!item || !location) {
        return res.status(404).json({ message: `Item (${itemData.sku}) or Location (${itemData.locationName}) not found` });
      }

      // Update Stock
      let stock = await Stock.findOne({ item: item._id, location: location._id });
      if (stock) {
        stock.quantity += itemData.quantity;
      } else {
        stock = new Stock({ item: item._id, location: location._id, quantity: itemData.quantity });
      }
      await stock.save();

      transactionItems.push({
        item: item._id,
        quantity: itemData.quantity,
        location: location._id
      });
    }

    const transaction = new Transaction({
      type: 'INBOUND',
      items: transactionItems,
      user: req.user.id
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
    const { items } = req.body; // Array of { sku, locationName, quantity }
    const transactionItems = [];

    for (const itemData of items) {
      const item = await Item.findOne({ sku: itemData.sku });
      const location = await Location.findOne({ name: itemData.locationName });

      if (!item || !location) {
        return res.status(404).json({ message: `Item (${itemData.sku}) or Location (${itemData.locationName}) not found` });
      }

      let stock = await Stock.findOne({ item: item._id, location: location._id });
      if (!stock || stock.quantity < itemData.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${itemData.sku} at ${itemData.locationName}` });
      }

      stock.quantity -= itemData.quantity;
      await stock.save();

      transactionItems.push({
        item: item._id,
        quantity: itemData.quantity,
        location: location._id
      });
    }

    const transaction = new Transaction({
      type: 'OUTBOUND',
      items: transactionItems,
      user: req.user.id
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
