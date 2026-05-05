import mongoose, { Schema, Document, Model } from 'mongoose';

// IUser defines the shape of a user document in MongoDB.
// Extending Document gives us access to Mongoose fields like _id, save(), etc.
export interface IUser extends Document {
  username: string;
  password: string; // Always stored as a bcrypt hash, never plain text
}

// The schema enforces the structure and validation rules at the database level.
// `unique: true` on username prevents duplicate accounts at the DB level (backed by a MongoDB index).
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Prevent OverwriteModelError in dev/test.
// In development, files can be re-evaluated (e.g. hot reload), which would try to register
// the model twice and throw. We reuse the existing model if it's already been registered.
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
