// CommonJS setup file for Jest integration tests
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Login signs real JWTs in these tests. Supply a fake test-only secret before
// the app is imported so local runs do not depend on a developer's .env.test.
process.env.JWT_SECRET = 'authms-integration-test-only-secret';

let mongoServer;

// The first run may download a large MongoDB binary. Give only database setup
// extra time; individual tests still keep Jest's normal timeout.
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create({
    instance: { launchTimeout: 60_000 },
  });
  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}, 600_000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
