import axios from "axios";

// Read API URL from environment variable or fallback to http://localhost:3000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Axios instance configured for backend API
const API = axios.create({
  baseURL: API_URL,
});

// Get all tasks
export const fetchTasks = async () => {
  const response = await API.get("/tasks");
  return response.data;
};

// Create a new task
export const createTask = async (taskData) => {
  const response = await API.post("/tasks", taskData);
  return response.data;
};

// Update an existing task by ID
export const updateTask = async (id, updatedData) => {
  const response = await API.put(`/tasks/${id}`, updatedData);
  return response.data;
};

// Delete a task by ID
export const deleteTask = async (id) => {
  const response = await API.delete(`/tasks/${id}`);
  return response.data;
};

// Import tasks from public Google Sheet URL
export const importSheetTasks = async (sheetUrl) => {
  const response = await API.post("/import", { sheetUrl });
  return response.data;
};
