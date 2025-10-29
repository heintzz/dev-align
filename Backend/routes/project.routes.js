const express = require('express');
const {
  getProjects,
  getAllProjects,
  getProjectById,
  createProject,
  createProjectWithAssignments,
  updateProject,
  deleteProject,
} = require('../controllers/project.controller');
const auth = require('../middlewares/authorization');
const verifyToken = require('../middlewares/token');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: API for managing projects
 */

/**
 * @swagger
 * /project:
 *   get:
 *     summary: Get projects (role-based filtering)
 *     description: Managers see only their own projects. HR sees all projects and can filter by creator.
 *     tags: [Projects]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID (HR only)
 *     responses:
 *       200:
 *         description: A list of projects
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           status:
 *                             type: string
 *                           deadline:
 *                             type: string
 *                             format: date
 *                           teamMemberCount:
 *                             type: integer
 *                           createdBy:
 *                             type: object
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 */
router.get('/', verifyToken, getProjects);

/**
 * @swagger
 * /project/all:
 *   get:
 *     summary: Get all projects from all managers (HR only)
 *     description: HR endpoint to view all projects across all managers without role-based filtering
 *     tags: [Projects]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planning, active, on_hold, completed, cancelled]
 *         description: Filter by project status
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *     responses:
 *       200:
 *         description: A list of all projects
 */
router.get('/all', verifyToken, auth('hr'), getAllProjects);

/**
 * @swagger
 * /project/{projectId}:
 *   get:
 *     summary: Get a project by ID
 *     tags: [Projects]
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
 *         description: Project details
 *       404:
 *         description: Project not found
 */
router.get('/:projectId', verifyToken, getProjectById);

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: Mobile App Development
 *               description:
 *                 type: string
 *                 example: Develop a cross-platform mobile application
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *                 example: planning
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2024-12-31
 *               teamMemberCount:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', verifyToken, auth('manager', 'hr'), createProject);

/**
 * @swagger
 * /project/with-assignments:
 *   post:
 *     summary: Create a new project with staff assignments (Manager only)
 *     description: Creates a project and automatically assigns staff members in a single operation. Manager role is automatically assigned as tech lead.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - staffIds
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *                 example: E-Commerce Platform Development
 *               description:
 *                 type: string
 *                 example: Build a full-featured e-commerce platform with payment gateway integration
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *                 example: planning
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *               staffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of user IDs to assign to the project
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
 *     responses:
 *       201:
 *         description: Project and assignments created successfully
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
 *                     project:
 *                       type: object
 *                     assignments:
 *                       type: array
 *                     message:
 *                       type: string
 *       400:
 *         description: Bad request - Missing required fields or invalid data
 *       404:
 *         description: One or more staff members not found
 */
router.post('/with-assignments', verifyToken, auth('manager'), createProjectWithAssignments);

/**
 * @swagger
 * /project/{projectId}:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [planning, active, on_hold, completed, cancelled]
 *               deadline:
 *                 type: string
 *                 format: date
 *               teamMemberCount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 */
router.put('/:projectId', verifyToken, auth('manager', 'hr'), updateProject);

/**
 * @swagger
 * /project/{projectId}:
 *   delete:
 *     summary: Delete a project
 *     tags: [Projects]
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
 *       204:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/:projectId', verifyToken, auth('manager', 'hr'), deleteProject);

module.exports = router;
