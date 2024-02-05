import sqlite3 from 'sqlite3'
import path from 'path'

const dbPath = path.resolve('src/main/service/database/database.db')
console.log('dbp ath director', dbPath)
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

export default db
