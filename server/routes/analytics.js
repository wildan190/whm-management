import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import Transaction from '../models/Transaction.js';
import Item from '../models/Item.js';

const router = express.Router();
router.use(auth);

// Trigger ABC Analysis
router.post('/abc-analysis', adminOnly, async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: 'OUTBOUND' });
    const frequencyMap = {};

    transactions.forEach(tx => {
      tx.items.forEach(line => {
        const itemId = line.item.toString();
        frequencyMap[itemId] = (frequencyMap[itemId] || 0) + line.quantity;
      });
    });

    const items = await Item.find();
    const sortedItems = items.map(item => ({
      id: item._id,
      freq: frequencyMap[item._id.toString()] || 0
    })).sort((a, b) => b.freq - a.freq);

    const totalItems = sortedItems.length;
    
    for (let i = 0; i < totalItems; i++) {
      let abcClass = 'C';
      const percentile = (i / totalItems) * 100;
      
      if (percentile < 20) abcClass = 'A';
      else if (percentile < 50) abcClass = 'B';
      
      await Item.findByIdAndUpdate(sortedItems[i].id, { abcClass });
    }

    res.json({ message: 'Analisis ABC selesai diperbarui' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Labor Productivity Report
router.get('/labor-productivity', adminOnly, async (req, res) => {
  try {
    const report = await Transaction.aggregate([
      {
        $group: {
          _id: '$user',
          totalItems: { $sum: { $size: '$items' } },
          totalDuration: { $sum: '$duration' },
          transactionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          username: '$userDetails.username',
          itemsPerHour: {
            $cond: [
              { $gt: ['$totalDuration', 0] },
              { $multiply: [{ $divide: ['$totalItems', '$totalDuration'] }, 3600] },
              0
            ]
          },
          transactionCount: 1
        }
      }
    ]);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
