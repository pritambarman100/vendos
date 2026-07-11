const mongoose = require('mongoose');
// ডাটাবেস ফাইলের ভেতরেই dotenv লোড করে নেওয়া সবচেয়ে নিরাপদ
require('dotenv').config(); 

const connectDB = async () => {
    try {
        // এখানে চেক করে নিচ্ছি MONGO_URI আসলেই আছে কি না
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from .env file!");
        }

        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Database Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;