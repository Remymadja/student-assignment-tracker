import fs from 'node:fs/promises';
import path from 'node:path';
import mysql from 'mysql2/promise';

const sql = await fs.readFile(path.join(process.cwd(), 'sql', 'schema.sql'), 'utf8');
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
});
await connection.query(sql);
await connection.end();
console.log('Database student_assignment_tracker schema applied.');
