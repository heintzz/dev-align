const { Schema } = require('mongoose');

const projectAssignmentSchema = new Schema({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isTechLead: {
    type: Boolean,
    default: false,
  },
});

module.exports = projectAssignmentSchema;
