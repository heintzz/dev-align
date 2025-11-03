const { Schema } = require("mongoose");

const columnSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    key: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      // e.g., 'backlog', 'staging', 'onTesting', 'deployed'
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    color: {
      type: String,
      default: "#gray",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique column key per board
columnSchema.index({ projectId: 1, key: 1 }, { unique: true });
columnSchema.index({ projectId: 1, order: 1 });

module.exports = columnSchema;
