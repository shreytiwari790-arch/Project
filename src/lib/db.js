// db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://shreytiwari790_db_user:NcdHdIrUZ4pmnB9a@cluster0.dkkomod.mongodb.net/books_db"
    );
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // exit if DB connection fails
  }
};

module.exports = connectDB;
