const { Schema } = require('mongoose');

const borrowRequestSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    staffId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Manager who needs to approve (the staff's direct manager)
    },
    isApproved: {
      type: Boolean,
      default: null, // null = pending, true = approved, false = rejected
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
borrowRequestSchema.index({ approvedBy: 1, isApproved: 1 });
borrowRequestSchema.index({ projectId: 1, staffId: 1 });

module.exports = borrowRequestSchema;