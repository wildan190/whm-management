import express from 'express';
import { auth } from '../middleware/auth.js';
import Item from '../models/Item.js';
import Location from '../models/Location.js';
import Stock from '../models/Stock.js';

const router = express.Router();

router.use(auth);

// Items
router.get('/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

router.post('/items', async (req, res) => {
  try {
    const item = new Item(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Locations
router.get('/locations', async (req, res) => {
  const locations = await Location.find();
  res.json(locations);
});

router.post('/locations', async (req, res) => {
  try {
    const location = new Location(req.body);
    await location.save();
    res.status(201).json(location);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Stock Overview
router.get('/stock', async (req, res) => {
  const stock = await Stock.find().populate('item').populate('location');
  res.json(stock);
});

router.patch('/stock/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const stock = await Stock.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/stock/:id/cycle-count', async (req, res) => {
  try {
    const { physicalQuantity } = req.body;
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ message: 'Stock not found' });

    stock.quantity = physicalQuantity;
    stock.lastCycleCount = new Date();
    await stock.save();
    res.json(stock);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
