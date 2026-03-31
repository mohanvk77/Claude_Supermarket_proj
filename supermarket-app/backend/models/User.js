const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  name:     { type: String, required: true },
  role:     { type: String, default: 'admin' },
}, { timestamps: true });

// Compare password method - plain comparison, no auto-hashing
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compareSync(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
