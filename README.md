# StudyFlow

StudyFlow is a MERN-stack classroom management application that connects students and instructors. It handles task tracking, assignment submissions, project team management, and attendance marking.

## Features

### For Students:
- Dashboard: Statistics, progress bars, and notifications for tasks.
- Task Management: Track pending and in-progress tasks.
- Assignments: Upload assignment files linked to specific tasks. Uploading an assignment automatically marks the related task as "Done".
- Projects: Collaborate with teammates and manage project statuses.
- Profile: Customize profile details and student IDs.

### For Instructors:
- Create Tasks: Publish tasks to all students or assign them individually.
- Mark Attendance: Track student attendance on a daily basis.
- Grade Assignments: Review files submitted by students.

## Tech Stack

- Frontend: React 18, Vite, React Router DOM, Axios
- Backend: Node.js, Express.js
- Database: Custom JSON File-Based Database (server/data/db.json).
- Authentication: JSON Web Tokens (JWT) and bcrypt.
- Styling: Pure CSS.

## How to Run Locally

### Prerequisites
Node.js installed on your machine.

### 1. Setup the Backend
Open a terminal and run the following commands:
```bash
cd server
npm install
npm run dev
```
The server will start on http://localhost:5000.

### 2. Setup the Frontend
Open a second terminal and run:
```bash
cd client
npm install
npm run dev
```
The client will start on http://localhost:5173. 

## Database Structure
All data (users, tasks, assignments, projects, attendance) is automatically saved to server/data/db.json in a JSON structure.

---
Created by Gursimran
