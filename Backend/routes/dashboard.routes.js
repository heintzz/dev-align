const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/token');
const auth = require('../middlewares/authorization');
const { topContributors } = require('../controllers/dashboard.controller');

/**
 * @swagger
 * /dashboard/top-contributors:
 *   get:
 *     summary: Get top contributors (users with most completed tasks)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [this_month, last_month, this_year, all]
 *         description: Period filter (default: this_month)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of contributors to return (default: 10)
 *     responses:
 *       200:
 *         description: List of top contributors
 */
// Allow any authenticated user to access this endpoint (no role restriction)
router.get('/top-contributors', verifyToken, topContributors);

module.exports = router;