const express = require('express');
const router = express.Router();

const { createEmployee } = require('../controllers/hr.controller');
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

module.exports = router;
