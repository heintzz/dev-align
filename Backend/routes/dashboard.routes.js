const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/token");
const auth = require("../middlewares/authorization");
const { getDashboardData } = require("../controllers/dashboard.controller");

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get all dashboard data including statistics, project stats, and top contributors
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
 *         description: Complete dashboard data
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
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalEmployees:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                         resignedEmployees:
 *                           type: object
 *                           properties:
 *                             count:
 *                               type: integer
 *                     projectStatistics:
 *                       type: object
 *                       properties:
 *                         completed:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                         onHold:
 *                           type: integer
 *                         rejected:
 *                           type: integer
 *                     topContributors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           position:
 *                             type: string
 *                           doneCount:
 *                             type: integer
 */
// Allow any authenticated user to access this endpoint (no role restriction)
router.get("/", verifyToken, getDashboardData);

module.exports = router;
