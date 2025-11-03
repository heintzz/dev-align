const express = require("express");
const {
  getTasks,
  createTask,
  createColumn,
  getColumns,
  moveTask,
  editTask,
  updateColumn,
  deleteColumn,
  deleteTask,
} = require("../controllers/task.controller");
const auth = require("../middlewares/authorization");
const verifyToken = require("../middlewares/token");
const router = express.Router();

router.get("/", verifyToken, getTasks);
router.post("/", verifyToken, createTask);
router.patch("/", verifyToken, editTask);
router.patch("/move", verifyToken, moveTask);
router.delete("/:taskId", verifyToken, deleteTask);
router.post("/column", verifyToken, createColumn);
router.get("/columns", verifyToken, getColumns);
router.patch("/column", verifyToken, updateColumn);
router.delete("/column/:columnId", verifyToken, deleteColumn);

module.exports = router;
