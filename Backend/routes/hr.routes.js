const express = require('express');
const router = express.Router();

const {
	createEmployee,
	listEmployees,
	getEmployee,
	updateEmployee,
	deleteEmployee,
	importEmployees,
	parseCv,
	getImportTemplate,
	getColleagues,
} = require('../controllers/hr.controller');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const verifyToken = require('../middlewares/token');
const auth = require('../middlewares/authorization');

/**
 * @swagger
 * tags:
 *   name: HR
 *   description: API for HR operations
 */

/**
 * @swagger
 * /hr/employee:
 *   post:
 *     summary: Create a new employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               placeOfBirth:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               position:
 *                 type: string
 *               managerId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [staff, manager, hr]
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Bad request
 */
router.post('/employee', verifyToken, auth('hr'), createEmployee);

/**
 * @swagger
 * /hr/employees:
 *   get:
 *     summary: List employees (paginated)
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of employees
 */
router.get('/employees', verifyToken, auth('hr', 'manager'), listEmployees);

/**
 * @swagger
 * /hr/employee/{id}:
 *   get:
 *     summary: Get employee by id
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee data
 */
router.get('/employee/:id', verifyToken, getEmployee);

/**
 * @swagger
 * /hr/employee/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated employee
 */
router.put('/employee/:id', verifyToken, auth('hr'), updateEmployee);



/**
 * @swagger
 * /hr/employee/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee deleted
 */
router.delete('/employee/:id', verifyToken, auth('hr'), deleteEmployee);

/**
 * @swagger
 * /hr/employees/import:
 *   post:
 *     summary: Bulk import employees from Excel file
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import result
 */
router.post('/employees/import', verifyToken, auth('hr'), upload.single('file'), importEmployees);

/**
 * @swagger
 * /hr/parse-cv:
 *   post:
 *     summary: Parse uploaded CV (PDF) and extract basic info
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Parsed CV data
 */
router.post('/parse-cv', verifyToken, auth('hr'), upload.single('file'), parseCv);

/**
 * @swagger
 * /hr/employees/template:
 *   get:
 *     summary: Download Excel/CSV template for bulk import
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */
router.get('/employees/template', verifyToken, auth('hr'), getImportTemplate);

/**
 * @swagger
 * /hr/colleagues:
 *   get:
 *     summary: Get list of colleagues - teammates with same manager (includes direct manager) for staff/HR, or direct subordinates for managers
 *     tags: [HR]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of colleagues
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
 *                     userRole:
 *                       type: string
 *                       enum: [staff, manager, hr]
 *                       example: staff
 *                     colleagues:
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
 *                           position:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           skills:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                 name:
 *                                   type: string
 *                     directManager:
 *                       type: object
 *                       description: Only included for staff/HR roles
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         position:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                     totalColleagues:
 *                       type: integer
 *                       example: 5
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/colleagues', verifyToken, getColleagues);

module.exports = router;
