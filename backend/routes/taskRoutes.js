const express = require("express");
const router = express.Router();
const {
  importTasksFromSheet,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

// Import route
router.post("/import", importTasksFromSheet);

// CRUD routes
router.get("/tasks", getTasks);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);

module.exports = router;
