const { Schema } = require('mongoose');

const taskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    description: {
      type: String,
    },
    requiredSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    status: {
      type: String,
      enum: ['backlog', 'in_progress', 'review', 'done'],
      default: 'backlog',
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = taskSchema;
