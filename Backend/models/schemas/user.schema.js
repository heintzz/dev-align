const { Schema } = require('mongoose');

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: false,
    },
    place_of_birth: {
      type: String,
      required: false,
    },
    date_of_birth: {
      type: Date,
      required: false,
    },
    // TODO: add reference to the corresponding schema
    position: {
      type: String,
      required: false,
    },
    skills: {
      type: [String],
      required: false,
    },
    manager_id: {
      ref: 'User',
      type: Schema.Types.ObjectId,
      required: false,
      default: null,
    },
    role: {
      type: String,
      enum: ['hr', 'manager', 'staff'],
      default: 'staff',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = userSchema;
