const { Schema } = require('mongoose');

const positionSchema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = positionSchema;
