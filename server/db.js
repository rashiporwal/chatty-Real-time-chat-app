const mongoose = require('mongoose');

const connectDB = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required. Copy server/.env.example to server/.env.');
    }

    await mongoose.connect(process.env.DATABASE_URL, {
        serverSelectionTimeoutMS: 10000,
    });

    console.log('MongoDB connection successful.');
};


module.exports = connectDB;

