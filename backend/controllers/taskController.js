const mongoose = require("mongoose");
const axios = require("axios");
const csv = require("csv-parser");
const { Readable } = require("stream");
const Task = require("../models/taskModel");

// POST /import - Import tasks from public Google Sheet CSV
const importTasksFromSheet = async (req, res) => {
  try {
    const { sheetUrl } = req.body;

    if (!sheetUrl) {
      return res.status(400).json({
        success: false,
        message: "Sheet URL is required.",
      });
    }

    // 1. Extract Sheet ID from URL using regex
    const sheetIdMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch || !sheetIdMatch[1]) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google Sheets URL format.",
      });
    }

    const sheetId = sheetIdMatch[1];

    // 2. Construct export CSV URL
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    // 3. Fetch CSV data using Axios
    let response;
    try {
      response = await axios.get(csvUrl, {
        responseType: "text",
        timeout: 10000,
      });
    } catch (fetchError) {
      return res.status(400).json({
        success: false,
        message: "Inaccessible or private Google Sheet. Make sure 'Anyone with the link can view' is enabled.",
      });
    }

    const csvData = response.data;
    if (!csvData || !csvData.trim()) {
      return res.status(400).json({
        success: false,
        message: "Google Sheet is empty.",
      });
    }

    // 4. Parse CSV data using csv-parser
    const rows = [];
    const stream = Readable.from(csvData);

    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Google Sheet contains no data rows.",
      });
    }

    // 5. Validate required columns (Title, Description, Due Date)
    const firstRowKeys = Object.keys(rows[0]).map((key) => key.trim().toLowerCase());
    const hasTitle = firstRowKeys.includes("title");
    const hasDescription = firstRowKeys.includes("description");
    const hasDueDate = firstRowKeys.includes("due date") || firstRowKeys.includes("duedate");

    if (!hasTitle || !hasDescription || !hasDueDate) {
      return res.status(400).json({
        success: false,
        message: "Missing required columns. Google Sheet must contain: Title, Description, Due Date.",
      });
    }

    let imported = 0;
    let skipped = 0;

    // Helper function to get row value by case-insensitive key name
    const getRowValue = (row, keyName) => {
      const foundKey = Object.keys(row).find(
        (k) => k.trim().toLowerCase() === keyName.toLowerCase()
      );
      return foundKey ? row[foundKey] : undefined;
    };

    // Track duplicates within the same import file
    const batchSeenKeys = new Set();

    // 6. Validate rows and prevent duplicate tasks
    for (const row of rows) {
      const rawTitle = getRowValue(row, "title");
      const rawDesc = getRowValue(row, "description");
      const rawDueDate = getRowValue(row, "due date") || getRowValue(row, "duedate");

      if (!rawTitle || !rawDesc || !rawDueDate) {
        skipped++;
        continue;
      }

      const title = rawTitle.trim();
      const description = rawDesc.trim();
      const parsedDate = new Date(rawDueDate.trim());

      // Validate date
      if (isNaN(parsedDate.getTime())) {
        skipped++;
        continue;
      }

      // Key for duplicate check: sourceSheetId + title + dueDate
      const dateString = parsedDate.toISOString().split("T")[0]; // compare YYYY-MM-DD
      const duplicateKey = `${sheetId}_${title.toLowerCase()}_${dateString}`;

      if (batchSeenKeys.has(duplicateKey)) {
        skipped++;
        continue;
      }

      // Check existing task in database (sourceSheetId + title + dueDate)
      // Check date range for the same day to avoid timezone off-by-one comparisons
      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const existingTask = await Task.findOne({
        sourceSheetId: sheetId,
        title: { $regex: new RegExp(`^${title}$`, "i") },
        dueDate: { $gte: startOfDay, $lte: endOfDay },
      });

      if (existingTask) {
        batchSeenKeys.add(duplicateKey);
        skipped++;
        continue;
      }

      // Save valid new task
      await Task.create({
        title,
        description,
        dueDate: parsedDate,
        sourceSheetId: sheetId,
      });

      batchSeenKeys.add(duplicateKey);
      imported++;
    }

    return res.status(200).json({
      success: true,
      message: "Import completed",
      imported,
      skipped,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Database or server error during import: " + error.message,
    });
  }
};

// GET /tasks - Fetch all tasks sorted newest first
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching tasks: " + error.message,
    });
  }
};

// POST /tasks - Create a new manual task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({
        message: "Title, description, and due date are required.",
      });
    }

    const parsedDate = new Date(dueDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date format.",
      });
    }

    const newTask = new Task({
      title: title.trim(),
      description: description.trim(),
      dueDate: parsedDate,
      completed: false,
    });

    await newTask.save();
    return res.status(201).json(newTask);
  } catch (error) {
    return res.status(500).json({
      message: "Error creating task: " + error.message,
    });
  }
};

// PUT /tasks/:id - Update an existing task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID format.",
      });
    }

    const { title, description, dueDate, completed } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) {
      const parsedDate = new Date(dueDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          message: "Invalid due date format.",
        });
      }
      task.dueDate = parsedDate;
    }
    if (completed !== undefined) task.completed = Boolean(completed);

    await task.save();
    return res.status(200).json(task);
  } catch (error) {
    return res.status(500).json({
      message: "Error updating task: " + error.message,
    });
  }
};

// DELETE /tasks/:id - Delete a task by ID
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid task ID format.",
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting task: " + error.message,
    });
  }
};

module.exports = {
  importTasksFromSheet,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
};
