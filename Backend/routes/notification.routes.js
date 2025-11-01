const express = require('express');
const {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require('../controllers/notification.controller');
const verifyToken = require('../middlewares/token');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API for managing notifications
 */

/**
 * @swagger
 * /notification:
 *   get:
 *     summary: Get user's notifications
 *     description: Retrieves all notifications for the authenticated user with pagination
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [announcement, project_approval]
 *         description: Filter by notification type
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Filter by read status
 *     responses:
 *       200:
 *         description: List of notifications
 *       500:
 *         description: Internal server error
 */
router.get('/', verifyToken, getNotifications);

/**
 * @swagger
 * /notification/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     description: Get the count of unread notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notification count
 *       500:
 *         description: Internal server error
 */
router.get('/unread-count', verifyToken, getUnreadCount);

/**
 * @swagger
 * /notification/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     description: Marks all unread notifications as read for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       500:
 *         description: Internal server error
 */
router.put('/mark-all-read', verifyToken, markAllAsRead);

/**
 * @swagger
 * /notification/{notificationId}:
 *   get:
 *     summary: Get notification by ID
 *     description: Get a single notification by its ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/:notificationId', verifyToken, getNotificationById);

/**
 * @swagger
 * /notification/{notificationId}/mark-read:
 *   put:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.put('/:notificationId/mark-read', verifyToken, markAsRead);

/**
 * @swagger
 * /notification/{notificationId}:
 *   delete:
 *     summary: Delete notification
 *     description: Delete a specific notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted successfully
 *       404:
 *         description: Notification not found
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.delete('/:notificationId', verifyToken, deleteNotification);

module.exports = router;
