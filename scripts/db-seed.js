import bcrypt from 'bcrypt';
import { db } from '../config/db.js';
const hash = (password) => bcrypt.hash(password, 10);

await db.query('DELETE FROM submissions');
await db.query('DELETE FROM assignments');
await db.query('DELETE FROM enrollments');
await db.query('DELETE FROM courses');
await db.query('DELETE FROM users');

const users = [
  ['Admin User','admin@example.com', await hash('admin123'), 'admin'],
  ['Teacher User','teacher@example.com', await hash('teacher123'), 'teacher'],
  ['Remy Student','student@example.com', await hash('student123'), 'student'],
  ['Student Two','student2@example.com', await hash('student123'), 'student'],
  ['Student Three','student3@example.com', await hash('student123'), 'student']
];
for (const user of users) {
  await db.query('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', user);
}

await db.query(`INSERT INTO courses(name, code, teacher_id) VALUES
  ('Business Informatics','BI101',2),
  ('Project Management','PM201',2),
  ('Database Fundamentals','DB301',2)`);

await db.query(`INSERT INTO enrollments(student_id, course_id) VALUES
  (3,1),(3,2),(3,3),(4,1),(4,3),(5,2),(5,3)`);

await db.query(`INSERT INTO assignments(course_id,title,description,due_date,priority) VALUES
  (1,'ERD Design','Create an ERD for the student assignment tracker.','2026-07-05','High'),
  (1,'System Requirements','Document functional and non-functional requirements.','2026-07-10','Medium'),
  (2,'Project Charter','Prepare a simple project charter.','2026-07-08','High'),
  (3,'SQL Practice','Submit 10 SQL queries with screenshots.','2026-07-12','Medium')`);

await db.query(`INSERT INTO submissions(assignment_id,student_id,status,submitted_at,grade,feedback,notes) VALUES
  (1,3,'graded',NOW(),88.00,'Good ERD structure.','Submitted on time'),
  (1,4,'submitted',NOW(),NULL,NULL,'Needs grading'),
  (2,3,'submitted',NOW(),NULL,NULL,'Submitted'),
  (3,5,'not_started',NULL,NULL,NULL,'Not started yet')`);

await db.end();
console.log('Student Assignment Tracker demo data seeded.');
