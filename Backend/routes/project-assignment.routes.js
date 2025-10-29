const express = require('express');
const {
  assignUserToProject,
  getProjectAssignments,
  getAssignmentById,
  updateAssignment,
  removeAssignment,
} = require('../controllers/project-assignment.controller');
const auth = require('../middlewares/authorization');
const verifyToken = require('../middlewares/token');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Project Assignments
 *   description: API for managing project assignments
 */

/**
 * @swagger
 * /project-assignment:
 *   get:
 *     summary: Get all project assignments
 *     tags: [Project Assignments]
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
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter by project ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: isTechLead
 *         schema:
 *           type: boolean
 *         description: Filter by tech lead status
 *     responses:
 *       200:
 *         description: A list of project assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     perPage:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     assignments:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/', verifyToken, getProjectAssignments);

/**
 * @swagger
 * /project-assignment/{assignmentId}:
 *   get:
 *     summary: Get a project assignment by ID
 *     tags: [Project Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Assignment details
 *       404:
 *         description: Assignment not found
 */
router.get('/:assignmentId', verifyToken, getAssignmentById);

/**
 * @swagger
 * /project-assignment:
 *   post:
 *     summary: Assign a user to a project
 *     description: Assigns a user to a project. If the user's role is 'manager', isTechLead is automatically set to true.
 *     tags: [Project Assignments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - userId
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               userId:
 *                 type: string
 *                 example: 507f191e810c19729de860ea
 *               isTechLead:
 *                 type: boolean
 *                 description: Only applicable for non-manager users. Managers are automatically tech leads.
 *                 example: false
 *     responses:
 *       201:
 *         description: User assigned to project successfully
 *       400:
 *         description: Bad request or user already assigned
 *       404:
 *         description: User not found
 */
router.post('/', verifyToken, auth('manager', 'hr'), assignUserToProject);

/**
 * @swagger
 * /project-assignment/{assignmentId}:
 *   put:
 *     summary: Update a project assignment
 *     description: Updates assignment details. Note that managers will always remain as tech leads regardless of the isTechLead value sent.
 *     tags: [Project Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isTechLead:
 *                 type: boolean
 *                 description: Tech lead status (ignored for managers)
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       404:
 *         description: Assignment not found
 */
router.put('/:assignmentId', verifyToken, auth('manager', 'hr'), updateAssignment);

/**
 * @swagger
 * /project-assignment/{assignmentId}:
 *   delete:
 *     summary: Remove a project assignment
 *     tags: [Project Assignments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: assignmentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Assignment ID
 *     responses:
 *       204:
 *         description: Assignment removed successfully
 *       404:
 *         description: Assignment not found
 */
router.delete('/:assignmentId', verifyToken, auth('manager', 'hr'), removeAssignment);

module.exports = router;
