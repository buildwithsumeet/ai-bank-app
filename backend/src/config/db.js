import mongoose from 'mongoose';
import { seedDatabase } from '../utils/seedData.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/bankdb');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);

    // Auto-check and seed user DB with progress if empty
    await seedDatabase(false);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

