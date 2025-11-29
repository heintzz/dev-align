const express = require('express');
const {
  getProjects,
  getAllProjects,
  getProjectById,
  getProjectDetails,
  createProject,
  createProjectWithAssignments,
  updateProject,
  deleteProject,
  assignTechLead,
  getProjectStaff,
  getProjectTasks,    // Added for DEV-79
  updateTaskStatus,   // Added for DEV-80
  createTask,
  getTaskDetails,
  updateTaskDetails,
  deleteTask,
  assignUsersToTask,
  removeUserFromTask
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
 *     description: Managers see only their own projects. HR sees all projects and can filter by creator. Staff see only projects they are assigned to.
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
 *           enum: [active, completed]
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
 *           enum: [active, completed]
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
 * /project/{projectId}/details:
 *   get:
 *     summary: Get comprehensive project details with all users
 *     description: |
 *       Returns complete project information including:
 *       - Project details
 *       - Manager ID (user who created the project)
 *       - All staff IDs (all assigned users)
 *       - Tech lead staff IDs (staff with isTechLead=true, excluding manager)
 *       - Detailed information about manager and all staff
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
 *         description: Comprehensive project details with all users
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
 *                       description: Basic project information
 *                     managerId:
 *                       type: string
 *                       description: ID of the manager who created the project
 *                     allStaffIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of all staff user IDs assigned to project
 *                     techLeadStaffIds:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of staff user IDs who are tech leads (excluding manager)
 *                     managerDetails:
 *                       type: object
 *                       description: Detailed information about the manager
 *                     staffDetails:
 *                       type: array
 *                       description: Detailed information about all staff members
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/details', verifyToken, getProjectDetails);

/**
 * @swagger
 * /project/{projectId}/staff:
 *   get:
 *     summary: Get all staff assigned to a project
 *     description: Returns user ID and name for all staff members assigned to the project. Useful for task assignment.
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
 *         description: List of staff assigned to the project
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
 *                     projectId:
 *                       type: string
 *                     projectName:
 *                       type: string
 *                     totalStaff:
 *                       type: integer
 *                     staff:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           role:
 *                             type: string
 *                           isTechLead:
 *                             type: boolean
 *       400:
 *         description: Invalid project ID format
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/:projectId/staff', verifyToken, getProjectStaff);

/**
 * @swagger
 * /project/{projectId}/assign-tech-lead:
 *   put:
 *     summary: Assign or remove tech lead status for a staff member
 *     description: |
 *       Manages tech lead assignments with the following rules:
 *       - Manager is automatically a tech lead (cannot be changed)
 *       - Minimum 1 tech lead per project (the manager)
 *       - Maximum 2 tech leads per project (manager + 1 staff)
 *       - Manager can assign/change/remove tech lead status for staff
 *       - Only 1 staff can be tech lead at a time
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
 *             required:
 *               - staffId
 *               - isTechLead
 *             properties:
 *               staffId:
 *                 type: string
 *                 description: User ID of the staff member
 *                 example: "69016bcc7157f337f7e2e4eb"
 *               isTechLead:
 *                 type: boolean
 *                 description: Set to true to assign as tech lead, false to remove
 *                 example: true
 *     responses:
 *       200:
 *         description: Tech lead status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   description: Updated assignment details
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request (validation error or tech lead limit reached)
 *       404:
 *         description: Project or staff not found
 */
router.put('/:projectId/assign-tech-lead', verifyToken, auth('manager', 'hr'), assignTechLead);

/**
 * @swagger
 * /project:
 *   post:
 *     summary: Create a new project (auto-set to 'active' status)
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
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Project start date (defaults to current date if not provided)
 *                 example: 2025-10-30
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-31
 *               teamMemberCount:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       201:
 *         description: Project created successfully with status 'active'
 *       400:
 *         description: Bad request
 */
router.post('/', verifyToken, auth('manager', 'hr'), createProject);

/**
 * @swagger
 * /project/with-assignments:
 *   post:
 *     summary: Create a new project with staff assignments (Manager only)
 *     description: |
 *       Creates a project (auto-set to 'active') and automatically assigns staff members in a single operation.
 *       **IMPORTANT**: The project creator (manager) is automatically assigned to the project as a tech lead in the ProjectAssignment collection.
 *       Team member count includes manager (creator) + assigned staff. Direct subordinates are assigned immediately, while staff from other managers require approval.
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
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Project start date (defaults to current date if not provided)
 *                 example: 2025-10-30
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
 *         description: Project and assignments created successfully with status 'active'
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
 * /project/{projectId}/tasks:
 *   get:
 *     summary: Get all tasks for a specific project
 *     tags: [Projects]
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
 *         description: List of tasks with assignees and required skills
 *       403:
 *         description: User not assigned to project
 *       404:
 *         description: Project not found
 */
router.get('/:projectId/tasks', verifyToken, getProjectTasks);

/**
 * @swagger
 * /project/tasks/{taskId}/status:
 *   put:
 *     summary: Update task status (e.g., todo -> in_progress)
 *     tags: [Projects]
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
 *                 enum: [todo, in_progress, done]
 *     responses:
 *       200:
 *         description: Task status updated
 *       400:
 *         description: Invalid status transition
 *       403:
 *         description: User not assigned to task/project
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:taskId/status', verifyToken, updateTaskStatus);

/**
 * @swagger
 * /project/{projectId}/tasks:
 *   post:
 *     summary: Create a new task in a project (Tech Lead only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *               assigneeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 *       403:
 *         description: Not a tech lead
 */
router.post('/:projectId/tasks', verifyToken, createTask);

/**
 * @swagger
 * /project/tasks/{taskId}:
 *   get:
 *     summary: Get task details
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task details with assignees
 *       403:
 *         description: Not a project member
 *       404:
 *         description: Task not found
 */
router.get('/tasks/:taskId', verifyToken, getTaskDetails);

/**
 * @swagger
 * /project/tasks/{taskId}:
 *   put:
 *     summary: Update task details (Tech Lead only)
 *     tags: [Projects]
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
 *               title:
 *                 type: string
 *                 maxLength: 100
 *               description:
 *                 type: string
 *               requiredSkills:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 *       403:
 *         description: Not a tech lead
 *       404:
 *         description: Task not found
 */
router.put('/tasks/:taskId', verifyToken, updateTaskDetails);

/**
 * @swagger
 * /project/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task (Tech Lead only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Task deleted successfully
 *       403:
 *         description: Not a tech lead
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:taskId', verifyToken, deleteTask);

/**
 * @swagger
 * /project/tasks/{taskId}/assignees:
 *   post:
 *     summary: Assign users to task (Tech Lead only)
 *     tags: [Projects]
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
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users assigned to task
 *       403:
 *         description: Not a tech lead
 *       404:
 *         description: Task not found
 */
router.post('/tasks/:taskId/assignees', verifyToken, assignUsersToTask);

/**
 * @swagger
 * /project/tasks/{taskId}/assignees/{userId}:
 *   delete:
 *     summary: Remove user from task (Tech Lead only)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: User removed from task
 *       403:
 *         description: Not a tech lead
 *       404:
 *         description: Task not found
 */
router.delete('/tasks/:taskId/assignees/:userId', verifyToken, removeUserFromTask);

/**
 * @swagger
 * /project/{projectId}:
 *   put:
 *     summary: Update a project (comprehensive staff management and skill transfer)
 *     description: |
 *       Updates project details with advanced staff management:
 *       - Add/remove individual staff members (addStaffIds, removeStaffIds)
 *       - Replace all staff at once (replaceStaffIds)
 *       - When staff are removed, they are also removed from all task assignments
 *       - When status changes from 'active' to 'completed', all task skills are transferred to assigned users (no duplicates)
 *       - Team member count is automatically updated based on staff changes
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
 *                 enum: [active, completed]
 *                 description: When changed to 'completed', transfers all task skills to users
 *               deadline:
 *                 type: string
 *                 format: date
 *               addStaffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs to add to the project
 *                 example: ["507f1f77bcf86cd799439011"]
 *               removeStaffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User IDs to remove from project and all task assignments
 *                 example: ["507f191e810c19729de860ea"]
 *               replaceStaffIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Replace all staff with new set (removes all existing, adds new ones)
 *                 example: ["507f1f77bcf86cd799439011", "507f191e810c19729de860ea"]
 *     responses:
 *       200:
 *         description: Project updated successfully with detailed message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                 message:
 *                   type: string
 *                   description: Detailed message about what was updated
 *       404:
 *         description: Project not found or staff members not found
 */
router.put('/:projectId', verifyToken, auth('manager', 'hr'), updateProject);

/**
 * @swagger
 * /project/{projectId}:
 *   delete:
 *     summary: Delete a project (with cascading deletes)
 *     description: |
 *       Deletes a project and all related data:
 *       - All task assignments for tasks in this project
 *       - All tasks in this project
 *       - All project assignments
 *       - The project itself
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
 *         description: Project and all related data deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/:projectId', verifyToken, auth('manager', 'hr'), deleteProject);

module.exports = router;
