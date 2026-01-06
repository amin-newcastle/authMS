import mongoose, { Schema, Document, Model } from 'mongoose';

// Define an interface for the user document
export interface IUser extends Document {
  username: string;
  password: string;
}

// Define the schema with strong typing
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Prevent OverwriteModelError in dev/test
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
