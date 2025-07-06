import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    console.log('🔍 Testing MongoDB Atlas connection...');
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.log('❌ MONGODB_URI not found in environment variables');
      console.log('Please set up your MongoDB Atlas connection string in .env file');
      return;
    }

    console.log('📡 Connecting to MongoDB Atlas...');
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(mongoUri, options);
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test basic operations
    console.log('🧪 Testing database operations...');
    
    // Create a test collection
    const testCollection = mongoose.connection.collection('test');
    
    // Insert a test document
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    });
    
    console.log('✅ Insert test successful:', result.insertedId);
    
    // Find the test document
    const found = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Find test successful:', found ? 'Document found' : 'Document not found');
    
    // Clean up - delete the test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Delete test successful');
    
    console.log('🎉 All database tests passed!');
    console.log('Your MongoDB Atlas connection is working perfectly.');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your MONGODB_URI in .env file');
    console.log('2. Verify your MongoDB Atlas cluster is running');
    console.log('3. Ensure your IP is whitelisted in Network Access');
    console.log('4. Check your database user credentials');
    console.log('5. See MONGODB_ATLAS_SETUP.md for detailed instructions');
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB Atlas');
    }
    process.exit(0);
  }
};

testConnection(); 