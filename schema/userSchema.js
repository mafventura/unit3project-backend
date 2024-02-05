import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL);

const userSchema = new mongoose.Schema({
  email: {
    required: true,
    unique: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
});

export const User = mongoose.model("User", userSchema);

