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

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure backend/.env
SERVICEM8_API_KEY=your_api_key_here
PORT=3001
JWT_SECRET=your-secret-key

# 3. Start both servers
npm start
```

**Access:** http://localhost:3002 (Frontend) | http://localhost:3001 (Backend)

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

