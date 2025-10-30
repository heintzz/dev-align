const express = require('express');
const {
  getPositions,
  createPosition,
  createMultiplePositions,
  updatePosition,
  deletePosition,
  deleteMultiplePositions,
} = require('../controllers/position.controller');
const auth = require('../middlewares/authorization');
const verifyToken = require('../middlewares/token');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: API for managing positions
 */

/**
 * @swagger
 * /position:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
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
 *         description: A list of positions
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
 *                     perPage:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     positions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 */
router.get('/', verifyToken, auth('hr'), getPositions);

/**
 * @swagger
 * /position:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
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
 *                 example: Software Engineer
 *     responses:
 *       201:
 *         description: Position created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', verifyToken, auth('hr'), createPosition);

/**
 * @swagger
 * /position/{positionId}:
 *   put:
 *     summary: Update a position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
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
 *               name:
 *                 type: string
 *                 example: Senior Software Engineer
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       404:
 *         description: Position not found
 */
router.put('/:positionId', verifyToken, auth('hr'), updatePosition);

/**
 * @swagger
 * /position/{positionId}:
 *   delete:
 *     summary: Delete a position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: positionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
router.delete('/:positionId', verifyToken, auth('hr'), deletePosition);

/**
 * @swagger
 * /position/batch:
 *   post:
 *     summary: Create multiple positions at once
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Frontend Developer", "Backend Developer", "DevOps Engineer"]
 *     responses:
 *       201:
 *         description: Positions created (with summary of created/skipped)
 *       400:
 *         description: Bad request
 */
router.post('/batch', verifyToken, auth('hr'), createMultiplePositions);

/**
 * @swagger
 * /position/batch:
 *   delete:
 *     summary: Delete multiple positions at once
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               positionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"]
 *     responses:
 *       200:
 *         description: Positions deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/batch', verifyToken, auth('hr'), deleteMultiplePositions);

module.exports = router;
