const mongoose = require('mongoose');

const firmSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Firm name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Firm code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    address: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Firm', firmSchema);
