const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true
    },
    financialYear: {
      type: String,
      default: 'FY 2024-25',
      trim: true
    },
    firmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Firm',
      required: [true, 'Client must be associated with a firm'],
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator user is required']
    }
  },
  { timestamps: true }
);

// Compound index for firm and client
clientSchema.index({ firmId: 1, name: 1 });

module.exports = mongoose.model('Client', clientSchema);
