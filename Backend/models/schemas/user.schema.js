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
      default: null,
    },
    placeOfBirth: {
      type: String,
      required: false,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      required: false,
      default: null,
    },
    position: {
      ref: 'Position',
      type: Schema.Types.ObjectId,
      default: null,
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
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
