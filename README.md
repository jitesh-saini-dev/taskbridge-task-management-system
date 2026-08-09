# TaskBridge - Productivity Dashboard & Google Sheet Task Sync

TaskBridge is a complete, beginner-friendly full-stack task management application built with the **MERN** stack (MongoDB, Express.js, React, Node.js) and Tailwind CSS. It features full manual task CRUD operations and automated batch task importing from public Google Sheets.

---

## 📁 Project Structure

```
TaskBridge/
├── backend/
│   ├── controllers/
│   │   └── taskController.js   # API request handling & Google Sheet CSV parsing
│   ├── models/
│   │   └── taskModel.js        # Mongoose Schema for Task
│   ├── routes/
│   │   └── taskRoutes.js       # Express routes definition
│   ├── server.js               # Express app initialization & MongoDB connection
│   ├── .env                    # Environment variables (PORT, MONGODB_URI)
│   ├── .env.example            # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ImportSheet.jsx # Google Sheet URL input & import status
│   │   │   ├── TaskForm.jsx    # Manual task creation form
│   │   │   └── TaskList.jsx    # Task display, filtering, completion, edit, delete
│   │   ├── App.jsx             # Main dashboard layout & state management
│   │   ├── api.js              # Axios API calls to backend (http://localhost:5000)
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # React root entry point
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## ⚡ Quick Start & Setup

### Prerequisites
- **Node.js**: v18+ installed
- **MongoDB**: Local MongoDB service running (`mongodb://localhost:27017`) or MongoDB Atlas connection URI.

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Ensure `.env` contains:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskbridge
```
*(Replace `MONGODB_URI` with your connection string if using MongoDB Atlas)*

Start backend server (runs on port **5000**):
```bash
npm run dev
# or: npm start
```

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📊 Google Sheet Import Format

To import tasks directly from Google Sheets:

1. Create a Google Sheet with the following **3 required headers** in Row 1:

| Title | Description | Due Date |
| :--- | :--- | :--- |
| Prepare Quarterly Report | Review Q3 financial metrics and slide deck | 2026-08-25 |
| Update API Specs | Add endpoints documentation for task import | 2026-09-01 |

2. Make the Google Sheet publicly accessible:
   - Click **Share** (top right)
   - Change General Access to **"Anyone with the link can view"**
3. Copy the URL (e.g. `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`)
4. Paste the URL into the **Import from Google Sheets** section in TaskBridge and click **Import Tasks**.

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/import` | Batch import tasks from public Google Sheet | `{ "sheetUrl": "PUBLIC_GOOGLE_SHEET_URL" }` |
| `GET` | `/tasks` | Get all tasks (sorted newest first) | None |
| `POST` | `/tasks` | Create a manual task | `{ "title": "...", "description": "...", "dueDate": "YYYY-MM-DD" }` |
| `PUT` | `/tasks/:id` | Update task details / status | `{ "title": "...", "description": "...", "dueDate": "...", "completed": true }` |
| `DELETE` | `/tasks/:id` | Delete a task by ID | None |

---

## 🧪 Testing Checklist & Features

- ✅ **Google Sheet CSV Parser**: Automates conversion of Google Sheets to CSV and imports valid task records while skipping invalid dates or empty rows.
- ✅ **Duplicate Prevention**: Prevents re-importing identical tasks matching `sourceSheetId + Title + Due Date`.
- ✅ **Full Task CRUD**: Create, read, update, delete, and toggle completion with instant UI updates.
- ✅ **Clean Modern UI**: Forest green sidebar, warm off-white background, dynamic metric cards, filter tabs, sort dropdown, and modal dialogs.
