const mongoose = require('mongoose');
const dns = require('dns');

// Force Google DNS — fixes querySrv ECONNREFUSED on some networks
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('');
    console.error('Fix checklist:');
    console.error('  1. Go to MongoDB Atlas → Network Access → Add your IP (or use 0.0.0.0/0 for dev)');
    console.error('  2. Make sure MONGO_URI in backend/.env is correct');
    console.error('  3. Try: ping cluster0.ntayrif.mongodb.net');
    console.error('');
    process.exit(1);
  }
};

module.exports = connectDB;
