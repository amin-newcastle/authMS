afterAll(async () => {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
