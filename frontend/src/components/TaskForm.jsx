import React, { useState } from "react";
import { createTask } from "../api";
import { Plus, Loader2 } from "lucide-react";

const TaskForm = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !dueDate) {
      setError("Please fill out all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createTask({
        title: title.trim(),
        description: description.trim(),
        dueDate,
      });

      // Clear form
      setTitle("");
      setDescription("");
      setDueDate("");

      // Notify parent to refetch tasks
      if (onTaskAdded) {
        onTaskAdded();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs mb-8">
      <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
        <span className="w-2 h-5 bg-emerald-600 rounded-full inline-block"></span>
        Add New Task
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-xs bg-rose-50 text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="taskTitle" className="block text-xs font-semibold text-stone-700 mb-1">
            Task Title *
          </label>
          <input
            id="taskTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Finalize project report"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="taskDesc" className="block text-xs font-semibold text-stone-700 mb-1">
            Description *
          </label>
          <textarea
            id="taskDesc"
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide task details and objectives..."
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition resize-none"
            disabled={loading}
          ></textarea>
        </div>

        <div>
          <label htmlFor="taskDueDate" className="block text-xs font-semibold text-stone-700 mb-1">
            Due Date *
          </label>
          <input
            id="taskDueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
