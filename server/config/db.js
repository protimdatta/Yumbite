import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let usingMemoryDB = false;

export const isMemoryDB = () => usingMemoryDB;

const connectDB = async () => {
  // MONGODB_URI is the standard name; MONGO_URI still works as fallback
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  // 1) Try the configured MongoDB first (Atlas or local)
  if (uri) {
    try {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection failed: ${error.message}`);
      console.error('Falling back to in-memory database (data resets on restart).');
    }
  }

  // 2) Fallback: in-memory MongoDB — no Atlas/local setup needed
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create({
      instance: { dbName: 'yumbite', startTimeout: 120000 },
      binary: { version: '6.0.14' }
    });
    const memUri = mongod.getUri();
    const conn = await mongoose.connect(memUri);
    usingMemoryDB = true;
    console.log(`In-memory MongoDB started: ${conn.connection.host} (resets on restart)`);
  } catch (error) {
    // Last resort: keep server up so health checks pass;
    // DB routes will return 500 with a clear message.
    console.error(`In-memory MongoDB failed: ${error.message}`);
    console.error('Server will keep running, but /api/* routes need a database.');
  }
};

export default connectDB;