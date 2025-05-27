import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function() { return !this.socialLogin; } },
  isAdmin: { type: Boolean, default: false },
  role: { type: String },
  title: { type: String },
  isActive: { type: Boolean, default: true },
  // Social login fields
  socialLogin: {
    provider: { type: String, enum: ['google', 'github', 'facebook', 'local'], default: 'local' },
    providerId: { type: String },
    avatar: { type: String }
  },
  avatar: { type: String }, // Profile picture URL
  // other fields
}, {
  timestamps: true
});

userSchema.pre("save", async function(next) {
  // Skip password hashing for social login users
  if (!this.password || !this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", userSchema);
export default User;
