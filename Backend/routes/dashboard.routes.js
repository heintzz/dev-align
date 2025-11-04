const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/token");
const auth = require("../middlewares/authorization");
const { topContributors } = require("../controllers/dashboard.controller");

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
 *         description: >
 *           Period filter for the report.
 *           Available values: `this_month`, `last_month`, `this_year`, or `all`.
 *           Default is `this_month`.
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: >
 *           Maximum number of contributors to return.
 *           Default is `10`.
 *
 *     responses:
 *       200:
 *         description: List of top contributors.
 */
router.get("/top-contributors", verifyToken, topContributors);

module.exports = router;
