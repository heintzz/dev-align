const { Notification } = require('../models');

// Lazy load nodemailer only when needed
let nodemailer;
let transporter;

function getTransporter() {
  if (!nodemailer) {
    try {
      nodemailer = require('nodemailer');
    } catch (error) {
      console.log('Nodemailer not installed. Email notifications will be skipped.');
      return null;
    }
  }

  if (!transporter) {
    // Configure email transporter
    // In production, use environment variables for email credentials
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    });
  }

  return transporter;
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
 * Send email notification
 * @param {Object} emailData - Email data
 * @param {String} emailData.to - Recipient email
 * @param {String} emailData.subject - Email subject
 * @param {String} emailData.html - Email HTML content
 * @returns {Promise<Object>} Send result
 */
async function sendEmailNotification(emailData) {
  try {
    const transporter = getTransporter();

    // Check if transporter is available and email is configured
    if (!transporter || !process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
      console.log('Email not configured. Skipping email notification.');
      console.log('Email would be sent to:', emailData.to);
      console.log('Subject:', emailData.subject);
      return { success: true, message: 'Email notification skipped (not configured)' };
    }

    const mailOptions = {
      from: `DevAlign System <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email notification:', error);
    // Don't throw error, just log it - email failure shouldn't break the app
    return { success: false, error: error.message };
  }
}

/**
 * Send both in-app and email notification
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
    // Create in-app notification
    const inAppNotification = await createInAppNotification({
      userId: data.user._id,
      title: data.title,
      message: data.message,
      type: data.type,
      relatedProject: data.relatedProject,
      relatedBorrowRequest: data.relatedBorrowRequest,
    });

    // Send email notification
    const emailResult = await sendEmailNotification({
      to: data.user.email,
      subject: data.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${data.title}</h2>
          <p style="color: #666; line-height: 1.6;">${data.message}</p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from DevAlign System. Please do not reply to this email.
          </p>
        </div>
      `,
    });

    return {
      success: true,
      inAppNotification,
      emailResult,
    };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Send notification to multiple users
 * @param {Array} users - Array of user objects
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @param {String} relatedProject - Optional: Related project ID
 * @returns {Promise<Array>} Results of all operations
 */
async function sendBulkNotification(users, title, message, type, relatedProject = null) {
  try {
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
    return results;
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

module.exports = {
  createInAppNotification,
  sendEmailNotification,
  sendNotification,
  sendBulkNotification,
};