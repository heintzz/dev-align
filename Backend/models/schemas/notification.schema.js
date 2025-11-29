const { Schema } = require('mongoose');

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'project_approval'],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // Optional: store related entity references for context
    relatedProject: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    relatedBorrowRequest: {
      type: Schema.Types.ObjectId,
      ref: 'BorrowRequest',
      required: false,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

// Index for faster queries
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = notificationSchema;