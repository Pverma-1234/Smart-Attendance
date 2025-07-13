const express = require('express');
const db = require('./db');
const XLSX = require('xlsx');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

let undoStack = [];
let attendanceLog = [];

// ✅ Register student
app.post('/api/register', (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) return res.status(400).json({ error: 'ID and Name are required' });

  db.run(`INSERT OR IGNORE INTO students (id, name) VALUES (?, ?)`, [id, name], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) {
      res.json({ status: '⚠️ Already registered' });
    } else {
      res.json({ status: `✅ Registered: ${name}` });
    }
  });
});

// ✅ Mark attendance manually
app.post('/api/manual', (req, res) => {
  const { id, status, date } = req.body;
  if (!id || !status || !date) return res.status(400).json({ error: 'Student ID, status, and date are required' });

  const timestamp = new Date(date);
  timestamp.setHours(9);
  const isoTime = timestamp.toISOString();

  undoStack.push({ id, status, timestamp: isoTime });
  attendanceLog.push({ id, status, date });

  db.run(`INSERT INTO logs (student_id, event, timestamp) VALUES (?, ?, ?)`, [id, status, isoTime], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: `Marked ${status} for ${id} on ${date}` });
  });
});
// ✅ Express route to mark attendance as 'absent' instead of deleting (undo functionality)
app.delete('/api/undo', (req, res) => {
  const { id, date } = req.query;
  if (!id || !date) {
    return res.status(400).json({ error: 'Missing ID or date' });
  }

  const sql = `UPDATE logs SET event = 'absent' WHERE student_id = ? AND date(timestamp) = ?`;

  db.run(sql, [id, date], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ status: 'No matching record to update' });
    }
    res.json({ status: `✅ Attendance updated to absent for ID ${id} on ${date}` });
  });
});


// ✅ Undo last attendance (with full date clear)
app.delete('/api/undo', (req, res) => {
  const last = undoStack.pop();
  if (!last) return res.status(400).json({ error: 'Nothing to undo' });

  const dateOnly = last.timestamp.slice(0, 10);
  attendanceLog = attendanceLog.filter(entry => !(entry.id === last.id && entry.date === dateOnly));

  db.clearAttendanceForDate(last.id, dateOnly, (err, changes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ status: `⤴️ Removed all logs for ${last.id} on ${dateOnly}` });
  });
});

// ✅ Export attendance as Excel
app.get('/api/export', (req, res) => {
  const ws = XLSX.utils.json_to_sheet(attendanceLog);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Attendance');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename=Final_Attendance.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// ✅ Daily Report
app.get('/api/report', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  db.all(`SELECT id FROM students`, [], (err, allStudents) => {
    if (err) return res.status(500).json({ error: err.message });

    db.all(`SELECT DISTINCT student_id FROM logs WHERE date(timestamp) = ? AND event = 'present'`, [today], (err2, presentRows) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const presentSet = new Set(presentRows.map(row => row.student_id));
      const allIds = allStudents.map(row => row.id);
      const missing = allIds.filter(id => !presentSet.has(id));

      res.json({ present: [...presentSet], missing });
    });
  });
});

// ✅ Attendance history for graph
app.get('/api/history', (req, res) => {
  const { student_id, from, to } = req.query;
  if (!student_id || !from || !to) return res.status(400).json({ error: 'Student ID, from, and to dates required' });

  db.all(`
    SELECT date(timestamp) AS date,
           MAX(CASE WHEN event = 'absent' THEN 'absent' ELSE 'present' END) AS status
    FROM logs
    WHERE student_id = ? AND date(timestamp) BETWEEN ? AND ?
    GROUP BY date(timestamp)
    ORDER BY date(timestamp)
  `, [student_id, from, to], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ logs: rows });
  });
});

// ✅ Total students
app.get('/api/total', (req, res) => {
  db.get(`SELECT COUNT(*) as count FROM students`, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ count: row.count });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
