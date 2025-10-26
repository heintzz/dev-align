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
      default: null,
    },
    place_of_birth: {
      type: String,
      required: false,
      default: null,
    },
    date_of_birth: {
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
