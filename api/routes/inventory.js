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

export default router;
