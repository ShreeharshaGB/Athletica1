import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      console.error('MongoDB connection error: MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (error.name === 'MongoServerSelectionError') {
      console.error('Tip: If running on Render, ensure MongoDB Atlas Network Access allows 0.0.0.0/0 (anywhere).');
    }
    process.exit(1);
  }
};

export default connectDB;
export { connectDB };
