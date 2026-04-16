import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Item from './models/Item.js';
import Location from './models/Location.js';
import Stock from './models/Stock.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/whm';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected.');

    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Item.deleteMany({}),
      Location.deleteMany({}),
      Stock.deleteMany({}),
      Transaction.deleteMany({})
    ]);

    console.log('Seeding Users...');
    const admin = await User.create({ username: 'admin', password: 'password', role: 'admin' });
    const staff1 = await User.create({ username: 'staff1', password: 'password', role: 'user' });
    const staff2 = await User.create({ username: 'staff2', password: 'password', role: 'user' });

    console.log('Seeding Locations...');
    const locations = await Location.insertMany([
      { name: 'A-01', description: 'Rak Prioritas ABC-A', distanceFromDock: 10, maxWeight: 500, type: 'PICKING' },
      { name: 'A-02', description: 'Rak Reguler ABC-A', distanceFromDock: 15, maxWeight: 500, type: 'PICKING' },
      { name: 'B-01', description: 'Rak ABC-B', distanceFromDock: 30, maxWeight: 1000, type: 'BULK' },
      { name: 'C-01', description: 'Rak Terluar ABC-C', distanceFromDock: 60, maxWeight: 800, type: 'BULK' },
      { name: 'RCV-01', description: 'Area Penerimaan Sementara', distanceFromDock: 0, maxWeight: 2000, type: 'RECEIVING' }
    ]);

    console.log('Seeding Items (1 SKU = 1 Barang Fisik)...');
    const itemsData = [];
    
    // 5 Beras Premium
    for (let i = 1; i <= 5; i++) {
      itemsData.push({ sku: `BRS-00${i}`, barcode: `899000000${i}`, name: 'Beras Premium 5kg', category: 'Pangan', description: 'Beras kualitas super', abcClass: 'A', weight: 5 });
    }
    // 3 Gula Pasir
    for (let i = 1; i <= 3; i++) {
      itemsData.push({ sku: `GLA-00${i}`, barcode: `899111000${i}`, name: 'Gula Pasir 1kg', category: 'Pangan', description: 'Gula pasir kristal putih', abcClass: 'A', weight: 1 });
    }
    // 2 Minyak Goreng
    for (let i = 1; i <= 2; i++) {
      itemsData.push({ sku: `MNY-00${i}`, barcode: `899222000${i}`, name: 'Minyak Goreng 2L', category: 'Bahan Pokok', description: 'Minyak kelapa sawit', abcClass: 'B', weight: 2 });
    }

    const items = await Item.insertMany(itemsData);

    console.log('Seeding Stocks...');
    const stocksData = [];
    // Place Beras at A-01
    for (let i = 0; i < 5; i++) {
        let status = i === 4 ? 'QUARANTINE' : 'AVAILABLE';
        stocksData.push({ item: items[i]._id, location: locations[0]._id, quantity: 1, batchNumber: 'B-5KG-01', status: status });
    }
    // Place Gula at A-02
    for (let i = 5; i < 8; i++) {
        stocksData.push({ item: items[i]._id, location: locations[1]._id, quantity: 1, batchNumber: 'G-1KG-01', status: 'AVAILABLE' });
    }
    // Place Minyak at B-01
    for (let i = 8; i < 10; i++) {
        stocksData.push({ item: items[i]._id, location: locations[2]._id, quantity: 1, batchNumber: 'M-2L-01', status: 'AVAILABLE' });
    }

    const stocks = await Stock.insertMany(stocksData);

    console.log('Seeding Transactions...');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    await Transaction.insertMany([
      {
        type: 'INBOUND',
        status: 'COMPLETED',
        user: staff1._id,
        items: [
          { item: items[0]._id, location: locations[0]._id, quantity: 1 },
          { item: items[1]._id, location: locations[0]._id, quantity: 1 },
          { item: items[2]._id, location: locations[0]._id, quantity: 1 }
        ],
        startTime: pastDate,
        duration: 300, // 5 menit
        createdAt: pastDate
      },
      {
        type: 'OUTBOUND',
        status: 'COMPLETED',
        user: staff2._id,
        items: [
          { item: items[5]._id, location: locations[1]._id, quantity: 1 }, // Gula
          { item: items[8]._id, location: locations[2]._id, quantity: 1 }  // Minyak
        ],
        startTime: new Date(),
        duration: 450, // 7.5 menit
        createdAt: new Date()
      }
    ]);

    console.log('Database Seeding Completed Successfully! 🌱');
    process.exit(0);
  } catch (err) {
    console.error('Failed to seed database:', err);
    process.exit(1);
  }
};

seedDatabase();
