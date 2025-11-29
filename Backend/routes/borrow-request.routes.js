const express = require('express');
const {
  getPendingRequests,
  getBorrowRequestsByProject,
  respondToBorrowRequest,
} = require('../controllers/borrow-request.controller');
const verifyToken = require('../middlewares/token');
const auth = require('../middlewares/authorization');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Borrow Requests
 *   description: API for managing staff borrow requests between managers
 */

/**
 * @swagger
 * /borrow-request/pending:
 *   get:
 *     summary: Get pending borrow requests (Manager only)
 *     description: Get all pending borrow requests that require the authenticated manager's approval
 *     tags: [Borrow Requests]
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
 *     responses:
 *       200:
 *         description: List of pending borrow requests
 *       403:
 *         description: Forbidden - Only managers can access
 *       500:
 *         description: Internal server error
 */
router.get('/pending', verifyToken, getPendingRequests);

/**
 * @swagger
 * /borrow-request/project/{projectId}:
 *   get:
 *     summary: Get borrow requests for a project (Manager/HR only)
 *     description: Get all borrow requests related to a specific project
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of borrow requests for the project
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', verifyToken, getBorrowRequestsByProject);

/**
 * @swagger
 * /borrow-request/{requestId}/respond:
 *   put:
 *     summary: Approve or reject a borrow request (Manager only)
 *     description: Respond to a borrow request by approving or rejecting it
 *     tags: [Borrow Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Borrow request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - isApproved
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 description: true to approve, false to reject
 *                 example: true
 *     responses:
 *       200:
 *         description: Borrow request processed successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Borrow request not found
 *       500:
 *         description: Internal server error
 */
router.put('/:requestId/respond', verifyToken, respondToBorrowRequest);

module.exports = router;
