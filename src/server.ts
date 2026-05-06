// Runtime configuration (how the app runs)

import app from './app.js'; // Import the configured Express app instance (routes, middleware, etc.)
import connectDB from './config/db.connection.js'; // Import the function that handles connecting to the database (Repository layer entry point)
import config from './config/env.js'; // Centralized env loader and config

// Connect to the database
connectDB();

// Get the port number from centralised config (with sane defaults)
const PORT = config.port;

// Only start the server if not in a test environment
let server: import('http').Server | undefined;
if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
  });
}

// Handle unhandled promise rejections — log the error and shut down gracefully
process.on('unhandledRejection', (e: unknown) => {
  console.log(`Error: ${(e as Error)?.message || e}`);
  server?.close(() => process.exit(1));
});

// Export the server instance (useful for tests)
export default server;
