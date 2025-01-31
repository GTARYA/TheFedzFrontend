
import mongoose from 'mongoose'


type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log('Already connected to the database');
    return;
  }

  console.log(process.env.MONGODB_URI,"process.env.MONGODB_URI");
  
  
  try {
    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI!);
    connection.isConnected = db.connections[0].readyState;
    console.log('Database connected successfully');

  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

export default dbConnect;