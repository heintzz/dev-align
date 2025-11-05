const express = require("express");
const {
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
} = require("../controllers/skill.controller");
const auth = require("../middlewares/authorization");
const verifyToken = require("../middlewares/token");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Skills
 *   description: API for managing skills
 */

/**
 * @swagger
 * /skill:
 *   get:
 *     summary: Get all skills
 *     tags: [Skills]
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
 *         description: A list of skills
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
 *                     skills:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 */
router.get("/", verifyToken, getSkills);

/**
 * @swagger
 * /skill:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
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
 *                 example: JavaScript
 *     responses:
 *       201:
 *         description: Skill created successfully
 *       400:
 *         description: Bad request
 */
router.post("/", verifyToken, createSkill);

/**
 * @swagger
 * /skill/{skillId}:
 *   put:
 *     summary: Update a skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
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
 *                 example: TypeScript
 *     responses:
 *       200:
 *         description: Skill updated successfully
 *       404:
 *         description: Skill not found
 */
router.put("/:skillId", verifyToken, auth("hr"), updateSkill);

/**
 * @swagger
 * /skill/{skillId}:
 *   delete:
 *     summary: Delete a skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Skill deleted successfully
 *       404:
 *         description: Skill not found
 */
router.delete("/:skillId", verifyToken, auth("hr"), deleteSkill);

module.exports = router;
