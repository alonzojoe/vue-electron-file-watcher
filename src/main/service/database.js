import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.resolve('src/main/service/database/database.db')
const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      orders_directory TEXT,
      target_directory TEXT,
      api_endpoint TEXT
    )
  `)
})

export default db
