# 🔥 FitCore — Gym & Fitness Center Management System

Full stack web application built with React.js, Node.js, Express, and MongoDB.

---

## 📁 Project Structure

```
fitcore/
├── backend/          ← Node.js + Express API
│   ├── config/       ← DB connection
│   ├── controllers/  ← Business logic
│   ├── middleware/   ← JWT auth middleware
│   ├── models/       ← MongoDB schemas
│   ├── routes/       ← API routes
│   ├── utils/        ← Email, SMS, Seeder
│   ├── uploads/      ← Uploaded files (auto-created)
│   ├── .env.example  ← Copy to .env and fill values
│   ├── server.js     ← Entry point
│   └── package.json
│
└── frontend/         ← React.js App
    ├── public/
    ├── src/
    │   ├── components/common/  ← Layout, Sidebar
    │   ├── context/            ← Auth & Theme context
    │   ├── pages/              ← All page components
    │   ├── utils/api.js        ← Axios API calls
    │   ├── App.js              ← Routes
    │   ├── index.js
    │   └── index.css           ← Global styles
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

---

### Step 1 — Backend Setup

```bash
cd fitcore/backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Now open .env and fill in your values (MongoDB URI etc.)

# Create uploads folder
mkdir uploads

# Seed the database with sample data
npm run seed

# Start backend server
npm run dev
```

Backend runs on: **http://localhost:5000**

---

### Step 2 — Frontend Setup

```bash
cd fitcore/frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend runs on: **http://localhost:3000**

---

## 🔑 Demo Login Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@fitcore.com      | admin123    |
| Trainer | bilal@fitcore.com      | trainer123  |
| Member  | ayesha@email.com       | member123   |

---

## ✅ Features

| Feature                          | Status |
|----------------------------------|--------|
| Member signup/login (JWT)        | ✅     |
| Role-based access (Admin/Trainer/Member) | ✅ |
| Admin dashboard with live stats  | ✅     |
| Member management (CRUD)         | ✅     |
| Trainer management               | ✅     |
| Class scheduling & enrollment    | ✅     |
| Attendance tracking (manual/QR)  | ✅     |
| Workout plan upload & assign     | ✅     |
| Diet plan management             | ✅     |
| Payment & subscription tracking  | ✅     |
| Stripe integration               | ✅     |
| Email notifications (Nodemailer) | ✅     |
| SMS notifications (Twilio)       | ✅     |
| Dark / Light theme toggle        | ✅     |
| Live Workout Timer               | ✅     |
| BMI Calculator                   | ✅     |
| QR Code generation               | ✅     |
| Responsive design                | ✅     |

---

## 🌍 API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/stats
GET    /api/dashboard/activity

GET    /api/members
POST   /api/members
PUT    /api/members/:id
DELETE /api/members/:id
GET    /api/members/:id/qr

GET    /api/trainers
POST   /api/trainers

GET    /api/classes
POST   /api/classes
POST   /api/classes/:id/enroll

GET    /api/attendance
POST   /api/attendance/checkin
POST   /api/attendance/qr-checkin

GET    /api/payments
POST   /api/payments
PUT    /api/payments/:id/mark-paid
POST   /api/payments/stripe-session

GET    /api/workouts/plans
POST   /api/workouts/plans
GET    /api/workouts/diet
POST   /api/workouts/diet
```

---

## 🛠️ Tech Stack

- **Frontend:** React.js, React Router v6, Axios, React Hot Toast
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT (JSON Web Tokens)
- **Payments:** Stripe
- **Email:** Nodemailer (Gmail)
- **SMS:** Twilio
- **QR Code:** qrcode npm package

---

Built by Mahjabeen | FitCore Gym Management System 🔥
