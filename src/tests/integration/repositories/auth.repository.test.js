const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const AuthRepository = require('../../../api/repositories/auth.repository');
const bcrypt = require('bcrypt');
const User = require('../../../api/models/user.model');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Disconnect any existing Mongoose connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('AuthRepository Integration Test', () => {
  it('should create a new user in the DB', async () => {
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { username: 'testuser', password: hashedPassword };

    // Using actual repository methods
    const createdUser = await AuthRepository.createUser(userData);

    expect(createdUser.username).toBe(userData.username);
    expect(createdUser.password).not.toBe(password); // Ensure it's hashed
  });

  it('should find a user by username in the DB', async () => {
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { username: 'testuser', password: hashedPassword };

    const createdUser = await AuthRepository.createUser(userData);
    const foundUser = await AuthRepository.findUserByUsername('testuser');

    expect(foundUser.username).toBe('testuser');
    expect(foundUser.password).toBe(createdUser.password);
  });
});
