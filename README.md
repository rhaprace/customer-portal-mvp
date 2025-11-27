# Customer Portal MVP

A customer portal integrating with ServiceM8 API for booking management.

## Tech

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Express.js, Node.js |
| Database | SQLite |
| API | ServiceM8 REST API |

## Prerequisites

- Node.js 18+
- npm

## Setup

### 1. Install Dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```env
SERVICEM8_API_KEY=your_api_key_here
PORT=3001
JWT_SECRET=your-secret-key
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Run Application

```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 4. Access

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Demo Login

```
Email: customer@example.com
Phone: 0412345678
```

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate customer |
| POST | `/api/auth/logout` | End session |
| GET | `/api/jobs` | List customer bookings |
| GET | `/api/jobs/:uuid` | Booking details |
| GET | `/api/jobs/:uuid/attachments` | Job attachments |
| GET | `/api/jobs/:uuid/messages` | Get messages |
| POST | `/api/jobs/:uuid/messages` | Send message |

## Documentation

See [TECH_NOTES.md](TECH_NOTES.md) for technical decisions and assumptions.

