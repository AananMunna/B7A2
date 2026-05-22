# DevPulse API

A RESTful backend API for tracking bugs and feature requests across software teams.

**Live URL:** https://your-deployment-url.onrender.com

---

## Features

- User registration and login with JWT authentication
- Role-based access control (contributor / maintainer)
- Create, read, update, and delete issues
- Filter and sort issues by type and status
- System metrics endpoint for maintainers
- PostgreSQL database with raw SQL queries

---

## Tech Stack

- Node.js + TypeScript
- Express.js
- PostgreSQL (NeonDB)
- bcrypt
- jsonwebtoken

---

## Setup Instructions

### 1. Clone the repository

git clone https://github.com/yourusername/devpulse.git
cd devpulse

### 2. Install dependencies

npm install

### 3. Configure environment variables

Create a `.env` file in the root directory:

PORT=5000
DATABASE_URL=your_neondb_connection_string
JWT_SECRET=your_secret_key

### 4. Run the server

npm run dev

Server will start on `http://localhost:5000`
Tables will be created automatically on first run.

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/signup | Public | Register a new user |
| POST | /api/auth/login | Public | Login and receive JWT |

### Issues

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/issues | Authenticated | Create a new issue |
| GET | /api/issues | Public | Get all issues (filter/sort) |
| GET | /api/issues/:id | Public | Get a single issue |
| PATCH | /api/issues/:id | Authenticated | Update an issue |
| DELETE | /api/issues/:id | Maintainer | Delete an issue |
| GET | /api/issues/metrics | Maintainer | Get system metrics |

### Query Parameters for GET /api/issues

| Param | Values | Default |
|-------|--------|---------|
| sort | newest, oldest | newest |
| type | bug, feature_request | none |
| status | open, in_progress, resolved | none |

---

## Database Schema

### users

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| name | VARCHAR(255) | Required |
| email | VARCHAR(255) | Unique, required |
| password | VARCHAR(255) | Hashed, never returned |
| role | VARCHAR(20) | contributor or maintainer |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

### issues

| Column | Type | Notes |
|--------|------|-------|
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required, max 150 chars |
| description | TEXT | Required, min 20 chars |
| type | VARCHAR(20) | bug or feature_request |
| status | VARCHAR(20) | open, in_progress, resolved |
| reporter_id | INTEGER | References users.id |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

## Authorization

Include the JWT token in the request header:

Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...