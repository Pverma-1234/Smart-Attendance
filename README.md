# 🧠 Smart Attendance System

A production-ready backend API built with **Express.js**, **SQLite**, and optionally **SQL Server**, designed for educational institutions to streamline student attendance management with features like real-time logging, undo functionality, and Excel export.

---

## 🚀 Key Features

- ✅ Register and manage students
- 📅 Mark daily attendance (manual or automated)
- ⏳ Undo last action or delete by date
- 📤 Export data to Excel (.xlsx)
- 📈 Attendance history reports (graph-friendly)
- 🧮 Daily stats & total counts
- ⚙️ Designed for simplicity and scalability

---

## ⚙️ Tech Stack

| Tech             | Purpose                          |
|------------------|----------------------------------|
| **Node.js**      | JavaScript runtime               |
| **Express.js**   | Web framework for RESTful APIs   |
| **SQLite**       | Lightweight embedded database    |
| **MSSQL** *(opt)*| Microsoft SQL Server support     |
| **XLSX**         | Excel export for reporting       |
| **body-parser**  | Request body parsing middleware  |

---

## 🛠️ Getting Started

### 📥 Installation

```bash
git clone https://github.com/yourname/smart-attendance.git
cd smart-attendance
npm install
node server.js
```

By default, the server runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
.
├── server.js         # Main application entry point
├── db.js             # Database logic (SQLite)
├── attendance.db     # Local SQLite database file
├── public/           # Static assets (if needed)
├── package.json
└── README.md         # You're reading it!
```

---

## 🔌 API Endpoints

### 👤 Register Student

```http
POST /api/register
Body: { "id": "S123", "name": "John Doe" }
```

### 📍 Mark Attendance

```http
POST /api/manual
Body: { "id": "S123", "status": "present", "date": "2025-07-13" }
```

### ⏪ Undo Last Entry

```http
DELETE /api/undo
```

### 📤 Export to Excel

```http
GET /api/export
```

### 📊 Daily Report

```http
GET /api/report
```

### 📈 Student History

```http
GET /api/history?student_id=S123&from=2025-07-01&to=2025-07-13
```

### 🧾 Total Registered Students

```http
GET /api/total
```

---

## 🧠 Database Schema

### Students

| Field | Type | Description        |
|-------|------|--------------------|
| id    | TEXT | Student roll number (PK) |
| name  | TEXT | Full name          |

### Logs

| Field       | Type    | Description               |
|-------------|---------|---------------------------|
| id          | INTEGER | Auto-increment primary key|
| student_id  | TEXT    | Foreign key from students |
| event       | TEXT    | `present` / `absent`      |
| timestamp   | TEXT    | ISO timestamp             |

---

## 🏗️ SQL Server (Optional)

To enable MSSQL support:

1. Install the `mssql` package.
2. Add `.env` config:

```
MSSQL_USER=your_user
MSSQL_PASSWORD=your_pass
MSSQL_SERVER=localhost
MSSQL_DATABASE=smart_attendance
```

3. Use `mssql` in `db.js` if required.

---

## 🙌 Final Notes

- ⏰ Attendance timestamps default to 9AM for consistency.
- ♻️ Undo stack allows reversible attendance entries.
- 💡 Designed to scale from classrooms to institutions.

---
![image alt](https://github.com/Pverma-1234/Smart-Attendance/blob/main/Screenshot%202025-07-13%20215630.png?raw=true)
![image alt](https://github.com/Pverma-1234/Smart-Attendance/blob/main/Screenshot%202025-07-13%20215709.png?raw=true)

## 📣 Interviewer Note

> ✅ This project was built to demonstrate backend proficiency, database management, RESTful design, and real-world problem solving. It’s simple, elegant, and extendable.

