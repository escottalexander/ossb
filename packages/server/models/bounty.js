const mongoose = require("mongoose");
const { STATUS_OPTIONS } = require("../constants");

const Bounty = new mongoose.Schema({
  url: { type: String, required: true },
  reviewer: { type: String, required: true },
  reviewer_percentage: { type: Number, required: true },
  status: {
    type: String,
    enum: STATUS_OPTIONS,
    default: 'NEW',
  },
  funding: [
    {
      tokenAddress: String,
      amount: String,
    },
  ],
  created_date: { type: Date, default: new Date() },
});

Bounty.methods = {
    
};

exports.Bounty = mongoose.model('Bounty', Bounty);