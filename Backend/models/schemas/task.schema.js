const { Schema } = require("mongoose");

const TaskSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: "Column",
      required: true,
    },
    columnKey: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    requiredSkills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Skill",
      },
    ],
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    deadline: {
      type: Date,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TaskSchema.index({ projectId: 1, columnKey: 1, order: 1 });

module.exports = TaskSchema;
