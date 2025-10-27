const { Schema } = require('mongoose');

const tokenSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 2 * 60 * 60,
  },
});

module.exports = tokenSchema;
