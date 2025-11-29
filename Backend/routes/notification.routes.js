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
 *     description: Retrieves all notifications for the authenticated user with pagination. For 'project_approval' type notifications, includes detailed requester and approver information (id, name, email, role, position).
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
 *         description: List of notifications with populated requester/approver details for project_approval type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     unreadCount:
 *                       type: integer
 *                     notifications:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           title:
 *                             type: string
 *                           message:
 *                             type: string
 *                           type:
 *                             type: string
 *                             enum: [announcement, project_approval]
 *                           isRead:
 *                             type: boolean
 *                           relatedProject:
 *                             type: object
 *                           relatedBorrowRequest:
 *                             type: object
 *                             description: For project_approval type, includes requestedBy and approvedBy with full user details
 *                             properties:
 *                               _id:
 *                                 type: string
 *                               projectId:
 *                                 type: string
 *                               staffId:
 *                                 type: string
 *                               requestedBy:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   role:
 *                                     type: string
 *                                   position:
 *                                     type: object
 *                                     properties:
 *                                       _id:
 *                                         type: string
 *                                       name:
 *                                         type: string
 *                               approvedBy:
 *                                 type: object
 *                                 properties:
 *                                   _id:
 *                                     type: string
 *                                   name:
 *                                     type: string
 *                                   email:
 *                                     type: string
 *                                   role:
 *                                     type: string
 *                                   position:
 *                                     type: object
 *                                     properties:
 *                                       _id:
 *                                         type: string
 *                                       name:
 *                                         type: string
 *                               isApproved:
 *                                 type: boolean
 *                                 nullable: true
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
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
 *     description: Get a single notification by its ID. For 'project_approval' type notifications, includes detailed requester and approver information (id, name, email, role, position).
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
 *         description: Notification details with populated requester/approver for project_approval type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     title:
 *                       type: string
 *                     message:
 *                       type: string
 *                     type:
 *                       type: string
 *                       enum: [announcement, project_approval]
 *                     isRead:
 *                       type: boolean
 *                     relatedProject:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         description:
 *                           type: string
 *                         status:
 *                           type: string
 *                     relatedBorrowRequest:
 *                       type: object
 *                       description: For project_approval type, includes requestedBy and approvedBy with full user details
 *                       properties:
 *                         _id:
 *                           type: string
 *                         projectId:
 *                           type: string
 *                         staffId:
 *                           type: string
 *                         requestedBy:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             role:
 *                               type: string
 *                             position:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                         approvedBy:
 *                           type: object
 *                           properties:
 *                             _id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             email:
 *                               type: string
 *                             role:
 *                               type: string
 *                             position:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                         isApproved:
 *                           type: boolean
 *                           nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
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
