const express = require("express");
const {
  getTasks,
  createTask,
  createColumn,
  getColumns,
  moveTask,
} = require("../controllers/task.controller");
const auth = require("../middlewares/authorization");
const verifyToken = require("../middlewares/token");
const router = express.Router();

router.get("/", verifyToken, getTasks);
router.post("/", verifyToken, createTask);
router.patch("/move", verifyToken, moveTask);
router.post("/column", verifyToken, createColumn);
router.get("/columns", verifyToken, getColumns);

module.exports = router;
