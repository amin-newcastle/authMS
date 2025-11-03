// Runtime configuration (how the app runs)

// Import the configured Express app instance (routes, middleware, etc.)
import dotenv from 'dotenv';

import app from './src/app.js';
// Import the function that handles connecting to the database (Repository layer entry point)
import connectDB from './src/config/db.connection.js';

// Import and load environment variables
dotenv.config({ path: 'src/config/config.env' });

// Connect to the database
connectDB();

// Get the port number from environment variables
const PORT = process.env.PORT;

// Only start the server if not in a test environment
let server;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });
}

// Handle any unhandled promise rejections globally (e.g., failed async operations or DB fails to connect)
// Ensures that the process exits gracefully with a meaningful error message
process.on('unhandledRejection', (e) => {
  console.log(`Error: ${e.message}`);
  server.close(() => process.exit(1));
});

// Export the app instance
export default server;
