
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: {
    type: String,
    index: true,
    unique: true,
    required: true,
  },

  password: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

  facebook: String,
  google: String,
  tokens: Array,

  avatar: String,

  roles: { type: Number },

  profile: {
    name: { type: String },
    phone: { type: String },
    address: { type: Map },
    document: {
      number: { type: Number },
      type: { type: String }
    }
  },

  bank: {
    code: { type: Number },
    account: { type: Number },
    agency: { type: Number }
  },

  fcm: String
});

const User = mongoose.model('User', userSchema);
module.exports = User;