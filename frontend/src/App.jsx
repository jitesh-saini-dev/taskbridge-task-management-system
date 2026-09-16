import React, { useState, useEffect } from "react";
import { fetchTasks } from "./api";
import ImportSheet from "./components/ImportSheet";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import {
  LayoutDashboard,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tasks on mount
  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Summary metrics
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  // Due Today metric
  const todayStr = new Date().toISOString().split("T")[0];
  const dueTodayTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const taskDateStr = new Date(t.dueDate).toISOString().split("T")[0];
    return taskDateStr === todayStr && !t.completed;
  }).length;

  // Current Date display
  const currentDateFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#faf9f6] text-stone-800 flex flex-col md:flex-row">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-[#132a1e] text-white p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
            T
          </div>
          <span className="font-extrabold text-base tracking-tight">TaskBridge</span>
        </div>
        <span className="text-xs bg-emerald-800 px-2.5 py-1 rounded-lg font-semibold text-emerald-200">
          Dashboard
        </span>
      </div>

      {/* DESKTOP DARK GREEN SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-[#132a1e] text-white p-6 border-r border-stone-800 shrink-0 min-h-screen sticky top-0 h-screen justify-between">
        <div className="space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-extrabold text-xl shadow-xs">
              T
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-none">
                TaskBridge
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase mt-1 block">
                Productivity Hub
              </span>
            </div>
          </div>

          {/* Navigation Links - Single Dashboard Entry */}
          <nav className="space-y-1.5">
            <div className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-700 text-white shadow-xs">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              Dashboard
            </div>
          </nav>
        </div>

        {/* Small Helpful Tip Card */}
        <div className="bg-[#18392b] p-4 rounded-2xl border border-emerald-800/60 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>Productivity Tip</span>
          </div>
          <p className="text-[11px] text-stone-300 leading-relaxed">
            Batch import your Google Sheet tasks anytime to keep your workflow synchronized.
          </p>
        </div>
      </aside>

      {/* MAIN DASHBOARD WORKSPACE */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
        {/* 1. HEADER / GREETING */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-8 pb-4 border-b border-stone-200/80">
          <div>
            <h1 className="text-2xl font-extrabold text-stone-800 tracking-tight">
              Hello 👋
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              Here's what's happening with your tasks.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-xs self-start sm:self-auto">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{currentDateFormatted}</span>
          </div>
        </header>

        {/* 2. SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Total Tasks
              </p>
              <h3 className="text-2xl font-extrabold text-stone-800 mt-1">
                {totalTasks}
              </h3>
            </div>
            <div className="p-3 bg-stone-100 rounded-xl text-stone-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Pending Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                Pending
              </p>
              <h3 className="text-2xl font-extrabold text-stone-800 mt-1">
                {pendingTasks}
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Completed Tasks */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                Completed
              </p>
              <h3 className="text-2xl font-extrabold text-stone-800 mt-1">
                {completedTasks}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Due Today */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Due Today
              </p>
              <h3 className="text-2xl font-extrabold text-stone-800 mt-1">
                {dueTodayTasks}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </section>

        {/* 3. GOOGLE SHEET IMPORT SECTION */}
        <section className="mb-8">
          <ImportSheet onImportSuccess={loadTasks} />
        </section>

        {/* 4. TASK MANAGEMENT WORKSPACE (Quick Add & Tasks List) */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Add Task */}
          <div className="lg:col-span-1">
            <TaskForm onTaskAdded={loadTasks} />
          </div>

          {/* Tasks List */}
          <div className="lg:col-span-2">
            <TaskList
              tasks={tasks}
              onTaskUpdated={loadTasks}
              loading={loading}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
