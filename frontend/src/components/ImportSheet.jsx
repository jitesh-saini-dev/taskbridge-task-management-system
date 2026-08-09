import React, { useState } from "react";
import { importSheetTasks } from "../api";
import { FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Info } from "lucide-react";

const ImportSheet = ({ onImportSuccess }) => {
  const [sheetUrl, setSheetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleImport = async (e) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setMessage({ type: "error", text: "Please enter a Google Sheet URL." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const data = await importSheetTasks(sheetUrl.trim());
      if (data.success) {
        setMessage({
          type: "success",
          text: `Import completed! ${data.imported} task(s) imported, ${data.skipped} duplicate/invalid task(s) skipped.`,
        });
        setSheetUrl("");
        if (onImportSuccess) {
          onImportSuccess();
        }
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to import tasks.",
        });
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to import tasks. Make sure the Google Sheet is public ('Anyone with the link can view').";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs mb-8">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-stone-800">Import from Google Sheets</h2>
          <p className="text-xs text-stone-500">
            Sync tasks automatically from any public Google Sheet link.
          </p>
        </div>
      </div>

      <form onSubmit={handleImport} className="mt-4 space-y-4">
        <div>
          <label htmlFor="sheetUrl" className="block text-xs font-semibold text-stone-700 mb-1.5">
            Google Sheet Public URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="sheetUrl"
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit"
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-sm rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <span>Import Tasks</span>
              )}
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`p-3.5 rounded-xl text-sm flex items-start gap-2.5 ${message.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* Help Tip */}
        <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-xl border border-stone-100">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Required Columns:</strong> Title, Description, Due Date (e.g. 2026-08-15). Ensure sheet sharing is set to "Anyone with link".
          </span>
        </div>
      </form>
    </div>
  );
};

export default ImportSheet;
