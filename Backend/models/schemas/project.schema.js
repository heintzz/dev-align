const { Schema } = require("mongoose");

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
      enum: ["active", "completed"],
      default: "active",
      maxlength: 20,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: false,
    },
    completedAt: {
      type: Date,
      required: false,
      default: null,
    },
    teamMemberCount: {
      type: Number,
      default: 1, // Default 1 to include manager
    },
    skills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // This automatically adds createdAt and updatedAt
  }
);

module.exports = projectSchema;
