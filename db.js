const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./attendance.db');

// ✅ Students table with PRIMARY KEY on id
const studentTable = `
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );
`;

// ✅ Logs table to store attendance events
const logsTable = `
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id TEXT NOT NULL,
    event TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );
`;

db.serialize(() => {
  db.run(studentTable);
  db.run(logsTable);
});

// ✅ Clear all logs of a student for a specific date (for accurate undo & graph)
db.clearAttendanceForDate = (id, date, callback) => {
  db.run(
    `DELETE FROM logs WHERE student_id = ? AND date(timestamp) = ?`,
    [id, date],
    function (err) {
      callback(err, this.changes);
    }
  );
};

module.exports = db;
