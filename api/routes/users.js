import express from 'express';
import { auth, adminOnly } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

router.use(auth);
router.use(adminOnly);

router.get('/', async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = new User({ username, password, role });
    await user.save();
    res.status(201).json({ id: user._id, username: user.username, role: user.role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
