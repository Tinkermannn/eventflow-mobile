# 🎉 EventFlow Backend API

> **Comprehensive Event Management & Real-Time Tracking System**

A robust RESTful API built with Node.js, TypeScript, Express, and Prisma ORM for managing events, participants, zones, and real-time location tracking.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [Installation Guide](#-installation-guide)
- [Database Setup](#-database-setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (ORGANIZER, SECURITY, PARTICIPANT)
- Secure password hashing with bcrypt
- Refresh token mechanism

### 📅 Event Management
- Create, read, update, delete events
- Event status management (DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED)
- Capacity management
- Location-based events with coordinates

### 👥 Participant Management
- Join/leave events
- Check-in/check-out functionality
- Participant tracking
- Real-time participant count

### 📍 Location Tracking
- Real-time location updates
- Geofencing support
- Location history
- Batch location updates

### 🗺️ Zone Management
- Create safety zones
- Risk level monitoring (LOW, MEDIUM, HIGH, CRITICAL)
- Geofence alerts
- Zone capacity tracking

### 🚨 Report System
- Incident reporting
- Priority levels (LOW, MEDIUM, HIGH, CRITICAL)
- Status tracking (PENDING, INVESTIGATING, RESOLVED, CLOSED)
- Report categories

### 🏢 Facility Management
- Facility registration
- Location-based facility search
- Capacity management

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **TypeScript** | Type-safe JavaScript |
| **Express.js** | Web framework |
| **Prisma ORM** | Database toolkit |
| **PostgreSQL (Neon)** | Cloud database |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Winston** | Logging |
| **Zod** | Input validation |
| **Helmet** | Security headers |
| **CORS** | Cross-origin resource sharing |
| **Morgan** | HTTP request logger |

---

## 💻 System Requirements

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher (or Neon account)
- **Git**: Latest version

---

## 📁 Project Structure

```
eventflow-backend/
├── 📂 logs/                      # Application logs
│   ├── combined.log             # All logs
│   └── error.log                # Error logs only
│
├── 📂 prisma/
│   └── schema.prisma            # Database schema
│
├── 📂 src/
│   ├── 📂 config/               # Configuration files
│   │   ├── database.ts          # Prisma client setup
│   │   └── environment.ts       # Environment variables
│   │
│   ├── 📂 controllers/          # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── event.controller.ts
│   │   ├── location.controller.ts
│   │   ├── participant.controller.ts
│   │   ├── report.controller.ts
│   │   └── zone.controller.ts
│   │
│   ├── 📂 middleware/           # Express middleware
│   │   ├── auth.ts              # JWT authentication
│   │   ├── errorHandler.ts     # Global error handler
│   │   ├── requestLogger.ts    # Request logging
│   │   ├── security.ts          # Security headers
│   │   └── validator.ts         # Input validation
│   │
│   ├── 📂 repositories/         # Database operations
│   │   ├── event.repository.ts
│   │   ├── location.repository.ts
│   │   ├── participant.repository.ts
│   │   ├── report.repository.ts
│   │   ├── user.repository.ts
│   │   └── zone.repository.ts
│   │
│   ├── 📂 routes/               # API routes
│   │   ├── auth.routes.ts
│   │   ├── event.routes.ts
│   │   ├── location.routes.ts
│   │   ├── participant.routes.ts
│   │   ├── report.routes.ts
│   │   ├── zone.routes.ts
│   │   └── index.ts             # Main router
│   │
│   ├── 📂 services/             # Business logic
│   │   ├── auth.service.ts
│   │   ├── event.service.ts
│   │   ├── location.service.ts
│   │   ├── participant.service.ts
│   │   ├── report.service.ts
│   │   └── zone.service.ts
│   │
│   ├── 📂 types/                # TypeScript types
│   │   ├── express.d.ts
│   │   └── interfaces.ts
│   │
│   ├── 📂 utils/                # Utility functions
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── logger.ts
│   │
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Server entry point
│
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore
├── nodemon.json                 # Nodemon config
├── package.json
├── tsconfig.json                # TypeScript config
└── README.md
```

---

## 🚀 Installation Guide

### Step 1: Clone Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/eventflow-backend.git

# Navigate to project directory
cd eventflow-backend
```

### Step 2: Install Dependencies

```bash
# Install all dependencies
npm install
```

**Dependencies installed:**
- Express.js
- TypeScript
- Prisma
- JWT libraries
- Validation libraries
- And more...

---

## 🗄️ Database Setup

### Option 1: Using Neon (Recommended for Development)

1. **Create Neon Account**
   - Go to [Neon Console](https://console.neon.tech)
   - Sign up for free account
   - Create new project

2. **Get Database URL**
   - Copy connection string from Neon dashboard
   - Format: `postgresql://user:password@host/database?sslmode=require`

3. **Configure Environment**
   ```bash
   # Copy .env.example to .env
   cp .env.example .env
   
   # Edit .env and add your DATABASE_URL
   ```

### Option 2: Local PostgreSQL

1. **Install PostgreSQL**
   ```bash
   # Windows (using Chocolatey)
   choco install postgresql
   
   # macOS (using Homebrew)
   brew install postgresql
   
   # Linux (Ubuntu/Debian)
   sudo apt-get install postgresql
   ```

2. **Create Database**
   ```bash
   # Start PostgreSQL service
   # Windows
   net start postgresql
   
   # macOS/Linux
   sudo service postgresql start
   
   # Create database
   psql -U postgres
   CREATE DATABASE eventflow;
   \q
   ```

3. **Update DATABASE_URL**
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/eventflow"
   ```

### Step 3: Generate Prisma Client

```bash
# Generate Prisma Client
npx prisma generate
```

**Expected output:**
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

### Step 4: Run Database Migrations

```bash
# Push schema to database
npx prisma db push
```

**Expected output:**
```
🚀 Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

### Step 5: (Optional) Seed Database

```bash
# Open Prisma Studio to view/edit data
npx prisma studio
```

**Prisma Studio will open at:** http://localhost:5555

---

## ⚙️ Environment Configuration

Create `.env` file in root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/eventflow?sslmode=require"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development`, `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | See Neon dashboard |
| `JWT_SECRET` | Secret for access tokens | Min 32 characters |
| `JWT_EXPIRES_IN` | Access token expiry | `24h`, `1d`, `60m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Min 32 characters |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d`, `30d` |
| `ALLOWED_ORIGINS` | CORS allowed origins | Comma-separated URLs |

---

## 🏃 Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

**Expected output:**
```
============================================================
🚀 EventFlow Backend Server Started Successfully!
============================================================
📍 Environment: development
🌐 Server URL: http://localhost:5000
📡 API Endpoint: http://localhost:5000/api/v1
💾 Database: Neon PostgreSQL (Connected)
🔐 JWT Auth: Enabled
============================================================
📋 Available Routes:
   - POST   /api/v1/auth/register
   - POST   /api/v1/auth/login
   - GET    /api/v1/events
   - POST   /api/v1/events
   - POST   /api/v1/participants/join
   - POST   /api/v1/locations
   - POST   /api/v1/zones
   - POST   /api/v1/reports
============================================================
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Other Commands

```bash
# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Check types
npm run type-check
```

---

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

---

### 🔐 Authentication Endpoints

#### 1. Register New User

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "PARTICIPANT"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "clxx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "PARTICIPANT",
      "createdAt": "2025-11-03T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "clxx...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "PARTICIPANT"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 3. Get Current User

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "clxx...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PARTICIPANT",
    "createdAt": "2025-11-03T10:00:00.000Z"
  }
}
```

---

### 📅 Event Endpoints

#### 1. Create Event

**Endpoint:** `POST /api/v1/events`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference",
  "startDate": "2025-12-01T09:00:00.000Z",
  "endDate": "2025-12-03T18:00:00.000Z",
  "location": "Convention Center",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "maxCapacity": 500,
  "status": "PUBLISHED"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": "clxx...",
    "name": "Tech Conference 2025",
    "description": "Annual technology conference",
    "startDate": "2025-12-01T09:00:00.000Z",
    "endDate": "2025-12-03T18:00:00.000Z",
    "status": "PUBLISHED",
    "currentParticipants": 0,
    "maxCapacity": 500
  }
}
```

#### 2. Get All Events

**Endpoint:** `GET /api/v1/events`

**Query Parameters:**
- `status` (optional): Filter by status (DRAFT, PUBLISHED, ONGOING, COMPLETED, CANCELLED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Example:**
```
GET /api/v1/events?status=PUBLISHED&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "clxx...",
        "name": "Tech Conference 2025",
        "status": "PUBLISHED",
        "startDate": "2025-12-01T09:00:00.000Z",
        "currentParticipants": 150,
        "maxCapacity": 500
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 👥 Participant Endpoints

#### 1. Join Event

**Endpoint:** `POST /api/v1/participants/join`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "eventId": "clxx..."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Successfully joined event",
  "data": {
    "id": "clxx...",
    "userId": "clxx...",
    "eventId": "clxx...",
    "status": "REGISTERED",
    "joinedAt": "2025-11-03T10:00:00.000Z"
  }
}
```

#### 2. Check-In to Event

**Endpoint:** `POST /api/v1/participants/:participantId/check-in`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "id": "clxx...",
    "status": "CHECKED_IN",
    "checkInTime": "2025-12-01T09:15:00.000Z"
  }
}
```

---

### 📍 Location Tracking Endpoints

#### 1. Update Location

**Endpoint:** `POST /api/v1/locations`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "participantId": "clxx...",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "accuracy": 10.5,
  "timestamp": "2025-11-03T10:30:00.000Z"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": {
    "id": "clxx...",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "timestamp": "2025-11-03T10:30:00.000Z"
  }
}
```

#### 2. Get Participant Location History

**Endpoint:** `GET /api/v1/locations/participant/:participantId`

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `limit` (optional): Number of records (default: 100)

---

### 🗺️ Zone Management Endpoints

#### 1. Create Zone

**Endpoint:** `POST /api/v1/zones`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "eventId": "clxx...",
  "name": "VIP Section",
  "description": "Exclusive VIP area",
  "geofence": {
    "type": "Polygon",
    "coordinates": [
      [
        [106.8456, -6.2088],
        [106.8466, -6.2088],
        [106.8466, -6.2098],
        [106.8456, -6.2098],
        [106.8456, -6.2088]
      ]
    ]
  },
  "riskLevel": "LOW",
  "maxCapacity": 100
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Zone created successfully",
  "data": {
    "id": "clxx...",
    "name": "VIP Section",
    "riskLevel": "LOW",
    "currentOccupancy": 0,
    "maxCapacity": 100
  }
}
```

---

### 🚨 Report Endpoints

#### 1. Create Report

**Endpoint:** `POST /api/v1/reports`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "eventId": "clxx...",
  "title": "Medical Emergency",
  "description": "Participant needs medical attention",
  "category": "MEDICAL",
  "priority": "HIGH",
  "latitude": -6.2088,
  "longitude": 106.8456
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Report created successfully",
  "data": {
    "id": "clxx...",
    "title": "Medical Emergency",
    "status": "PENDING",
    "priority": "HIGH",
    "createdAt": "2025-11-03T10:45:00.000Z"
  }
}
```

---

## 🔒 Authentication

### JWT Token Structure

**Access Token Payload:**
```json
{
  "userId": "clxx...",
  "role": "PARTICIPANT",
  "iat": 1699012800,
  "exp": 1699099200
}
```

### Using Authentication

**1. Include token in request headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. Example with cURL:**
```bash
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**3. Example with JavaScript (Fetch API):**
```javascript
fetch('http://localhost:5000/api/v1/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
})
```

### Role-Based Access Control

| Role | Permissions |
|------|-------------|
| **ORGANIZER** | Create events, manage zones, view all reports |
| **SECURITY** | View events, manage reports, track locations |
| **PARTICIPANT** | Join events, update location, create reports |

---

## 🧪 Testing

### Using cURL

**1. Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "role": "PARTICIPANT"
  }'
```

**2. Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Using Postman

1. **Import Collection:**
   - Download Postman collection (if provided)
   - Import to Postman

2. **Set Environment Variables:**
   - `base_url`: `http://localhost:5000/api/v1`
   - `access_token`: (from login response)

3. **Test Endpoints:**
   - Run requests from collection
   - Check responses

### Using Thunder Client (VS Code Extension)

1. **Install Extension:**
   - Search "Thunder Client" in VS Code extensions
   - Install

2. **Create Request:**
   - Click Thunder Client icon
   - New Request
   - Set method, URL, headers, body
   - Send

---

## 🚀 Deployment

### Deploy to Railway

1. **Create Railway Account:**
   - Go to [Railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login
   railway login
   
   # Initialize project
   railway init
   
   # Deploy
   railway up
   ```

3. **Add Environment Variables:**
   - Go to Railway dashboard
   - Select your project
   - Variables tab
   - Add all `.env` variables

4. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy `DATABASE_URL` to environment variables

### Deploy to Heroku

1. **Install Heroku CLI:**
   ```bash
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   
   # Login
   heroku login
   ```

2. **Create App:**
   ```bash
   # Create Heroku app
   heroku create eventflow-backend
   
   # Add PostgreSQL
   heroku addons:create heroku-postgresql:essential-0
   ```

3. **Deploy:**
   ```bash
   # Add Heroku remote
   heroku git:remote -a eventflow-backend
   
   # Push to Heroku
   git push heroku main
   ```

4. **Set Environment Variables:**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-secret-key
   # ... add other variables
   ```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Database Connection Error**

**Error:**
```
Error: P1001: Can't reach database server
```

**Solution:**
- Check `DATABASE_URL` in `.env`
- Ensure database is running
- Check network connection
- Verify SSL mode for Neon: `?sslmode=require`

#### 2. **Prisma Client Not Generated**

**Error:**
```
Module '@prisma/client' has no exported member 'User'
```

**Solution:**
```bash
# Delete Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npx prisma generate

# Restart VS Code
```

#### 3. **Port Already in Use**

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```

#### 4. **TypeScript Compilation Errors**

**Error:**
```
TSError: Unable to compile TypeScript
```

**Solution:**
```bash
# Clean build
rm -rf dist

# Rebuild
npm run build

# Check tsconfig.json
npm run type-check
```

#### 5. **JWT Token Invalid**

**Error:**
```
401 Unauthorized: Invalid token
```

**Solution:**
- Check token format: `Bearer <token>`
- Verify `JWT_SECRET` matches
- Check token expiration
- Re-login to get new token

---

## 📝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

2. **Create feature branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit changes:**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open Pull Request**

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Node.js community
- Prisma team
- Express.js maintainers
- All contributors

---

## 📞 Support

For support, email support@eventflow.com or join our Slack channel.

---

## 🔗 Links

- **Documentation**: [docs.eventflow.com](https://docs.eventflow.com)
- **Issue Tracker**: [GitHub Issues](https://github.com/yourusername/eventflow-backend/issues)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)

---

**Made with ❤️ by EventFlow Team**