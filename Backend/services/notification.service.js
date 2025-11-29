const { Notification } = require('../models');
const agenda = require('../configs/queue.config');

/**
 * Queue an email notification job
 * @param {Object} emailData - Email data
 * @param {String} emailData.to - Recipient email
 * @param {String} emailData.subject - Email subject
 * @param {String} emailData.html - Email HTML content
 * @param {Object} emailData.metadata - Optional metadata for tracking
 * @returns {Promise<Object>} Queue result
 */
async function queueEmailNotification(emailData) {
  try {
    console.log(`[Notification Service] Queuing email to: ${emailData.to}`);

    // Schedule the email job to run immediately
    const job = await agenda.now('send email notification', {
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      metadata: emailData.metadata || {},
    });

    console.log(`[Notification Service] Email queued successfully. Job ID: ${job.attrs._id}`);

    return {
      success: true,
      queued: true,
      jobId: job.attrs._id,
      message: 'Email notification queued for processing',
    };
  } catch (error) {
    console.error('[Notification Service] Error queuing email:', error);
    // Don't throw - email queueing failure shouldn't break the app
    return {
      success: false,
      queued: false,
      error: error.message,
    };
  }
}

/**
 * Create an in-app notification
 * @param {Object} notificationData - Notification data
 * @param {String} notificationData.userId - User ID to notify
 * @param {String} notificationData.title - Notification title
 * @param {String} notificationData.message - Notification message
 * @param {String} notificationData.type - Notification type (announcement or project_approval)
 * @param {String} notificationData.relatedProject - Optional: Related project ID
 * @param {String} notificationData.relatedBorrowRequest - Optional: Related borrow request ID
 * @returns {Promise<Object>} Created notification
 */
async function createInAppNotification(notificationData) {
  try {
    const notification = await Notification.create({
      userId: notificationData.userId,
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type,
      isRead: false,
      relatedProject: notificationData.relatedProject || null,
      relatedBorrowRequest: notificationData.relatedBorrowRequest || null,
    });

    return notification;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    throw error;
  }
}

/**
 * Send both in-app and email notification (using queue for email)
 * @param {Object} data - Notification data
 * @param {Object} data.user - User object with email and name
 * @param {String} data.title - Notification title
 * @param {String} data.message - Notification message
 * @param {String} data.type - Notification type
 * @param {String} data.relatedProject - Optional: Related project ID
 * @param {String} data.relatedBorrowRequest - Optional: Related borrow request ID
 * @returns {Promise<Object>} Result of both operations
 */
async function sendNotification(data) {
  try {
    // Create in-app notification (synchronous - must succeed immediately)
    const inAppNotification = await createInAppNotification({
      userId: data.user._id,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedProject: data.relatedProject,
      relatedBorrowRequest: data.relatedBorrowRequest,
    });

    // Queue email notification (asynchronous - processed by worker)
    const emailResult = await queueEmailNotification({
      to: data.user.email,
      subject: data.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">DevAlign Notification</h1>
          </div>
          <div style="background: #f7f9fc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">${data.title}</h2>
            <p style="color: #666; line-height: 1.6; font-size: 16px;">${data.message}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                This is an automated message from DevAlign System. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      metadata: {
        userId: data.user._id.toString(),
        userName: data.user.name,
        notificationType: data.type,
        notificationId: inAppNotification._id.toString(),
        queuedAt: new Date().toISOString(),
      },
    });

    return {
      success: true,
      inAppNotification,
      emailResult,
      message: 'In-app notification created and email queued successfully',
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple users (with queued emails)
 * @param {Array} users - Array of user objects
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {String} relatedProject - Optional: Related project ID
 * @returns {Promise<Array>} Results of all operations
 */
async function sendBulkNotification(users, title, message, type, relatedProject = null) {
  try {
    console.log(`[Notification Service] Sending bulk notification to ${users.length} users`);

    const results = await Promise.all(
      users.map(user =>
        sendNotification({
          user,
          title,
          message,
          type,
          relatedProject,
        })
      )
    );

    const successCount = results.filter(r => r.success).length;
    const queuedCount = results.filter(r => r.emailResult?.queued).length;

    console.log(`[Notification Service] Bulk notification complete: ${successCount}/${users.length} successful, ${queuedCount} emails queued`);

    return results;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue statistics
 */
async function getQueueStats() {
  try {
    const jobs = await agenda.jobs({ name: 'send email notification' });
    const completed = jobs.filter(j => j.attrs.lastFinishedAt && !j.attrs.failedAt).length;
    const failed = jobs.filter(j => j.attrs.failedAt).length;
    const pending = jobs.filter(j => !j.attrs.lastFinishedAt && !j.attrs.failedAt).length;
    const running = jobs.filter(j => j.attrs.lockedAt && !j.attrs.lastFinishedAt).length;

    return {
      total: jobs.length,
      completed,
      failed,
      pending,
      running,
    };
  } catch (error) {
    console.error('Error getting queue stats:', error);
    return {
      error: error.message,
    };
  }
}

module.exports = {
  createInAppNotification,
  queueEmailNotification,
  sendNotification,
  sendBulkNotification,
  getQueueStats,
};
