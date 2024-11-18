const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./todos.db', (err) => {
  if (err) {
    console.error('Error opening the database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT False,
    priority TEXT NOT NULL DEFAULT 'medium'
  )
`);

module.exports = db;
