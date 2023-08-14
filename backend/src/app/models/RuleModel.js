const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  value: { type: Number, required: true, enum : [1,2] },
  description: { type: String, required: true }
});

const RuleModel = mongoose.model('rules', UserSchema);

module.exports = RuleModel;