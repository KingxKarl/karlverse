import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the User schema
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
      type: String // Only used for local authentication
    },
    googleId: String, // For OAuth strategies if needed later
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

// Hash password before saving if modified/new
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
  next();
});

// Instance method for comparing passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
