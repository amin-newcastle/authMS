import mongoose, { Schema, Document, Model } from 'mongoose';

// IUser extends Mongoose Document, giving access to _id, save(), etc.
export interface IUser extends Document {
  username: string;
  password: string; // Always stored as a bcrypt hash, never plain text
}

// Schema enforces structure and validation — unique: true creates a MongoDB index on username
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Reuse existing model if already registered to prevent OverwriteModelError on hot reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
