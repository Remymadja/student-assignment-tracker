# Student Assignment Tracker

Dit is een **Student Assignment Tracker Project** met een werkend dashboard voor:

- Assignments aanmaken en bekijken
- Studenten bekijken
- Submissions volgen
- Grades registreren
- Dashboard met assignment progress
- MySQL database via Workbench
- Login voor admin, teacher en student

## 1. Installatie

```powershell
npm install
copy .env.example .env
```

Als jouw lokale MySQL root geen password heeft:

```env
DB_PASSWORD=
```

## 2. Database opzetten

### Optie A: via terminal

```powershell
npm run db:setup
npm run db:seed
```

### Optie B: via MySQL Workbench

1. Open `sql/schema.sql`
2. Run het volledige script
3. Daarna run je in terminal alsnog:

```powershell
npm run db:seed
```

Waarom? De demo passwords moeten met bcrypt gehasht worden.

## 3. Project starten

```powershell
npm run dev
```

Open:

```text
http://localhost:3000
```

## 4. Demo accounts

| Rol | Email | Password |

| Admin | admin@example.com | admin123 |
| Teacher | teacher@example.com | teacher123 |
| Student | student@example.com | student123 |

## 5. Belangrijke pagina's

- `/dashboard` - overzicht dashboard
- `/assignments` - assignment tracker
- `/submissions` - ingeleverde assignments en grades
- `/students` - studenten overzicht
- `/courses` - courses overzicht


## Technologies

This project uses the following technologies:

- Node.js
- Express.js
- EJS
- MySQL
- mysql2
- bcrypt
- express-session
- connect-flash
- multer
- jsonwebtoken
- Bootstrap
- CSS
- JavaScript

## Requirements

To run this project locally, install:

- Node.js
- npm
- MySQL Server
- MySQL Workbench
- Git

## Installation

```powershell
npm install
copy .env.example .env