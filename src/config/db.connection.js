const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '../config/config.evn' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
