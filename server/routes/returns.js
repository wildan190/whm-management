import express from 'express';
import { auth } from '../middleware/auth.js';
import Return from '../models/Return.js';
import Stock from '../models/Stock.js';
import Location from '../models/Location.js';

const router = express.Router();
router.use(auth);

router.post('/', async (req, res) => {
  try {
    const retur = new Return({ ...req.body, user: req.user.id });
    await retur.save();
    res.status(201).json(retur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get('/', async (req, res) => {
  const returns = await Return.find().populate('items.item').populate('user');
  res.json(returns);
});

router.patch('/:id/restock', async (req, res) => {
  try {
    const { locationName } = req.body;
    const retur = await Return.findById(req.params.id);
    const location = await Location.findOne({ name: locationName });

    if (!retur || !location) {
      return res.status(404).json({ message: 'Return or Location not found' });
    }

    for (const line of retur.items) {
      if (line.condition === 'GOOD') {
        let stock = await Stock.findOne({ item: line.item, location: location._id });
        if (stock) {
          stock.quantity += line.quantity;
        } else {
          stock = new Stock({ item: line.item, location: location._id, quantity: line.quantity });
        }
        await stock.save();
      }
    }

    retur.status = 'RESTOCKED';
    await retur.save();
    res.json(retur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
