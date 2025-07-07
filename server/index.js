import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import summaryRoutes from './routes/summary.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in environment variables');
      console.error('💡 Please set up your MongoDB Atlas connection string:');
      console.error('   1. Follow MONGODB_ATLAS_SETUP.md');
      console.error('   2. Add your connection string to server/.env');
      console.error('   3. Restart the server');
      process.exit(1);
    }

    // Check if it's still the placeholder
    if (mongoUri.includes('<username>') || mongoUri.includes('<cluster>')) {
      console.error('❌ Please replace the placeholder MongoDB Atlas connection string in server/.env');
      console.error('💡 Follow MONGODB_ATLAS_SETUP.md for instructions');
      process.exit(1);
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    
    // MongoDB Atlas connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(mongoUri, options);
    console.log('✅ Connected to MongoDB Atlas successfully');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (err) {
    console.error('❌ MongoDB Atlas connection failed:', err.message);
    console.error('💡 Please check your connection string and network access');
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/summary', summaryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Habit Builder API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 