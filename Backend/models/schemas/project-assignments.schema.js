const mongoose = require('mongoose');

const ProjectAssignmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isTechLead: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('ProjectAssignment', ProjectAssignmentSchema);
