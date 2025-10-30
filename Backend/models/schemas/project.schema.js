const { Schema } = require('mongoose');

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      maxlength: 20,
    },
    deadline: {
      type: Date,
      required: false,
    },
    teamMemberCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

module.exports = projectSchema;
