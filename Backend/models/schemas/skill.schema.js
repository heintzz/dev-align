const { Schema } = require('mongoose');

const skillSchema = new Schema(
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

module.exports = skillSchema;
