import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define User schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String // Used for local authentication
    },
    googleId: String, // For future OAuth providers
    name: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

// Pre-save hook: hash the password if it is new or modified
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Instance method to compare a given password with the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
