// Import mongoose library for MongoDB object modeling
const mongoose = require('mongoose');

// User schema for the users collection
const UserSchema = new mongoose.Schema({
  // Username: must be a required unique string
  username: {
    type: String,
    required: true,
    unique: true,
  },

  // Password: required string (will store hashed password)
  password: {
    type: String,
    required: true,
  },
  // ...other fields...
});

// Export a function to get the model, so it doesn't register on import
module.exports = () =>
  mongoose.models.User || mongoose.model('User', UserSchema);
