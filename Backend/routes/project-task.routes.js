const express = require('express');
const router = express.Router();
const {
  getStaffProjects,
  getStaffProjectDetail,
  getProjectTasks,
  updateTaskStatus,
} = require('../controllers/project-task.controller');
const verifyToken = require('../middlewares/token');

/**
 * @swagger
 * /project-tasks/staff/projects:
 *   get:
 *     summary: Get all projects where the authenticated user is a member
 *     tags: [Project Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *       401:
 *         description: Unauthorized
 */
router.get('/staff/projects', verifyToken, getStaffProjects);

/**
 * @swagger
 * /project-tasks/staff/projects/{projectId}:
 *   get:
 *     summary: Get detailed project information including tasks and team members
 *     tags: [Project Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project details with tasks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a project member
 *       404:
 *         description: Project not found
 */
router.get('/staff/projects/:projectId', verifyToken, getStaffProjectDetail);

/**
 * @swagger
 * /project-tasks/projects/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Project Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not a project member
 *       404:
 *         description: Project not found
 */
router.get('/projects/:projectId/tasks', verifyToken, getProjectTasks);

/**
 * @swagger
 * /project-tasks/tasks/{taskId}/status:
 *   put:
 *     summary: Update task status (e.g., To Do -> In Progress)
 *     tags: [Project Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [backlog, in_progress, review, done]
 *     responses:
 *       200:
 *         description: Updated task details
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not assigned to task/project
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:taskId/status', verifyToken, updateTaskStatus);

module.exports = router;