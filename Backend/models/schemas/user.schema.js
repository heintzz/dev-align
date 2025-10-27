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
    phoneNumber: {
      type: String,
      required: false,
    },
    placeOfBirth: {
      type: String,
      required: false,
    },
    dateOfBirth: {
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
    managerId: {
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
