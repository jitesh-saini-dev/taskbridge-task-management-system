import React, { useState } from "react";
import { updateTask, deleteTask } from "../api";
import {
  CheckSquare,
  Square,
  Calendar,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  FileSpreadsheet,
  Clock,
  CheckCircle2,
} from "lucide-react";

const TaskList = ({ tasks, onTaskUpdated, loading }) => {
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest'

  // Modal states
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);

  // Edit form state
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editCompleted, setEditCompleted] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Handle Complete Toggle
  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task._id, {
        completed: !task.completed,
      });
      if (onTaskUpdated) onTaskUpdated();
    } catch (error) {
      alert("Failed to update task completion status.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    // Format date string for HTML <input type="date" /> (YYYY-MM-DD)
    const formattedDate = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "";
    setEditDueDate(formattedDate);
    setEditCompleted(task.completed);
  };

  // Save Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editTitle.trim() || !editDescription.trim() || !editDueDate) {
      alert("Please fill out all fields.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateTask(editingTask._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        dueDate: editDueDate,
        completed: editCompleted,
      });
      setEditingTask(null);
      if (onTaskUpdated) onTaskUpdated();
    } catch (error) {
      alert("Failed to update task.");
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Confirm and Delete Task
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    try {
      await deleteTask(deletingTaskId);
      setDeletingTaskId(null);
      if (onTaskUpdated) onTaskUpdated();
    } catch (error) {
      alert("Failed to delete task.");
    }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === "pending") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  // Sort Tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.dueDate).getTime();
    const dateB = new Date(b.createdAt || b.dueDate).getTime();
    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  });

  // Format Date display
  const formatDateDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block"></span>
            Your Tasks
          </h2>
          <p className="text-xs text-stone-500">
            Showing {sortedTasks.length} of {tasks.length} tasks
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter Buttons */}
          <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200/60 text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "all"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "pending"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === "completed"
                  ? "bg-white text-emerald-800 shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {/* Task List Content */}
      {loading ? (
        <div className="py-12 text-center text-stone-400">
          <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-xs">Loading tasks...</p>
        </div>
      ) : sortedTasks.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center bg-stone-50/50 rounded-xl border border-dashed border-stone-200">
          <FileSpreadsheet className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-700">No tasks yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Import tasks from Google Sheets or create your first task using the form above.
          </p>
        </div>
      ) : (
        /* Task Cards */
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                task.completed
                  ? "bg-stone-50/80 border-stone-200/70"
                  : "bg-white border-stone-200 hover:border-emerald-200 hover:shadow-xs"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Completion Checkbox */}
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-700 transition cursor-pointer shrink-0"
                  title={task.completed ? "Mark as pending" : "Mark as completed"}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-700 fill-emerald-100" />
                  ) : (
                    <Square className="w-5 h-5 text-stone-400" />
                  )}
                </button>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-bold ${
                        task.completed
                          ? "line-through text-stone-400"
                          : "text-stone-800"
                      }`}
                    >
                      {task.title}
                    </h3>

                    {/* Status Pill */}
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        task.completed
                          ? "bg-stone-100 text-stone-500"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                      }`}
                    >
                      {task.completed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-stone-400" /> Completed
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3 text-emerald-600" /> Pending
                        </>
                      )}
                    </span>

                    {/* Sheet Import Badge */}
                    {task.sourceSheetId && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full font-medium">
                        Sheet Import
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-xs leading-relaxed ${
                      task.completed ? "text-stone-400" : "text-stone-600"
                    }`}
                  >
                    {task.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due: {formatDateDisplay(task.dueDate)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition cursor-pointer"
                  title="Edit Task"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeletingTaskId(task._id)}
                  className="p-1.5 text-stone-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-stone-200 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-stone-800">Edit Task</h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 bg-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="editCompletedCheck"
                  type="checkbox"
                  checked={editCompleted}
                  onChange={(e) => setEditCompleted(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                />
                <label htmlFor="editCompletedCheck" className="text-xs font-medium text-stone-700">
                  Mark task as completed
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition disabled:opacity-50"
                >
                  {isSubmittingEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTaskId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-stone-200 shadow-xl text-center">
            <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800">Delete Task</h3>
            <p className="text-xs text-stone-500 mt-1 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition shadow-xs"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;
