const { BorrowRequest, User, Project, ProjectAssignment } = require('../models');
const { sendNotification } = require('../services/notification.service');

/**
 * Get borrow requests for manager to approve/reject
 * (Shows requests where the authenticated manager needs to approve)
 */
const getPendingRequests = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const perPage = Math.max(1, Number(req.query.perPage) || 15);
    const skip = (page - 1) * perPage;

    // Only managers can view pending requests
    if (req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only managers can view borrow requests',
      });
    }

    const filter = {
      approvedBy: req.user.id,
      isApproved: null, // null = pending
    };

    const [total, requests] = await Promise.all([
      BorrowRequest.countDocuments(filter),
      BorrowRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .populate('projectId', 'name description deadline')
        .populate('staffId', 'name email position')
        .populate('requestedBy', 'name email'),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        page,
        perPage,
        total,
        requests,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

/**
 * Get all borrow requests (for a specific project - manager/HR only)
 */
const getBorrowRequestsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Only manager and HR can view
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Only managers and HR can view project borrow requests',
      });
    }

    const requests = await BorrowRequest.find({ projectId })
      .sort({ createdAt: -1 })
      .populate('staffId', 'name email position')
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email');

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

/**
 * Approve or reject a borrow request
 */
const respondToBorrowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { isApproved } = req.body; // true = approve, false = reject

    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'isApproved must be a boolean value',
      });
    }

    const borrowRequest = await BorrowRequest.findById(requestId)
      .populate('projectId', 'name description')
      .populate('staffId', 'name email')
      .populate('requestedBy', 'name email');

    if (!borrowRequest) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'Borrow request not found',
      });
    }

    // Check if the authenticated user is the approver
    if (borrowRequest.approvedBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You are not authorized to respond to this request',
      });
    }

    // Check if already processed
    if (borrowRequest.isApproved !== null) {
      const statusText = borrowRequest.isApproved ? 'approved' : 'rejected';
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: `This request has already been ${statusText}`,
      });
    }

    // Update borrow request
    borrowRequest.isApproved = isApproved;
    await borrowRequest.save();

    if (isApproved) {
      // Add staff to project assignment
      const existingAssignment = await ProjectAssignment.findOne({
        projectId: borrowRequest.projectId._id,
        userId: borrowRequest.staffId._id,
      });

      if (!existingAssignment) {
        await ProjectAssignment.create({
          projectId: borrowRequest.projectId._id,
          userId: borrowRequest.staffId._id,
          isTechLead: false,
        });

        // Update team member count
        await Project.findByIdAndUpdate(borrowRequest.projectId._id, {
          $inc: { teamMemberCount: 1 },
        });
      }

      // Notify the staff that they're approved and assigned
      await sendNotification({
        user: borrowRequest.staffId,
        title: 'Project Assignment Approved',
        message: `Your manager has approved your assignment to the project "${borrowRequest.projectId.name}". You are now officially part of the team!`,
        type: 'announcement',
        relatedProject: borrowRequest.projectId._id,
      });

      // Notify the project creator that staff was approved
      await sendNotification({
        user: borrowRequest.requestedBy,
        title: 'Staff Assignment Approved',
        message: `${borrowRequest.staffId.name} has been approved by their manager and is now assigned to your project "${borrowRequest.projectId.name}".`,
        type: 'announcement',
        relatedProject: borrowRequest.projectId._id,
      });
    } else {
      // Notify the project creator that request was rejected
      await sendNotification({
        user: borrowRequest.requestedBy,
        title: 'Staff Assignment Rejected',
        message: `The manager has declined your request to assign ${borrowRequest.staffId.name} to the project "${borrowRequest.projectId.name}". You may need to find a replacement.`,
        type: 'announcement',
        relatedProject: borrowRequest.projectId._id,
      });
    }

    return res.status(200).json({
      success: true,
      data: borrowRequest,
      message: isApproved
        ? 'Borrow request approved and staff assigned to project'
        : 'Borrow request rejected',
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

module.exports = {
  getPendingRequests,
  getBorrowRequestsByProject,
  respondToBorrowRequest,
};
