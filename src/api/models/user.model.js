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
});

// Export the User model based on the UserSchema to interact with the users collection
module.exports = mongoose.model('User', UserSchema);
