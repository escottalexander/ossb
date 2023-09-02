const mongoose = require("mongoose");

const Funder = new mongoose.Schema({
  address: { type: String, required: true },
  bounties: [{ bounty: { type: ObjectId, ref: "Bounty" }, amount: String }],
  created_date: { type: Date, default: new Date() },
});

Funder.methods = {

};

exports.Funder = mongoose.model("Funder", Funder);
