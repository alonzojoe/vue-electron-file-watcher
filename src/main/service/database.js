import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.join(__dirname, 'database', 'database.db')
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      ordersDirectory TEXT,
      targetDirectory TEXT,
      electronApiPath TEXT
    )
  `)
})

db.close()

export default db
