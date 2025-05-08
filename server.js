const app = require('./src/app.js'); // Import app instance
const connectDB = require('./src/config/db.connection.js');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: 'src/config/config.env' });

// Connect to the database
connectDB();

let PORT = process.env.PORT;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (e) => {
  console.log(`Error: ${e.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
