# Technical Notes - Customer Portal MVP

## Overview

This document outlines the technical decisions, assumptions, and implementation details for the Customer Portal MVP that integrates with ServiceM8.

---

## Architecture

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS | Modern React framework with type safety and rapid styling |
| Backend | Express.js, Node.js | Lightweight, flexible API server |
| Database | SQLite (better-sqlite3) | Zero-configuration, portable persistence |
| External API | ServiceM8 REST API | Real-time job and customer data |

---

## ServiceM8 API Integration

### Endpoints Implemented
| Endpoint | Purpose |
|----------|---------|
| `GET /companycontact.json` | Customer lookup by email |
| `GET /company/{uuid}.json` | Company details retrieval |
| `GET /job.json` | Fetch jobs filtered by company |
| `GET /attachment.json` | Job attachments (photos, documents) |
| `GET /jobactivity.json` | Scheduled activities |

### Authentication
- API Key via `X-API-Key` header
- Supports both live API and mock data fallback for development

---

## Key Assumptions

1. **Customer Identity**: Customers authenticate using email + phone number matching ServiceM8 company contact records

2. **Data Scope**: Customers view only jobs linked to their `company_uuid`

3. **Messaging**: Messages persist locally (SQLite) as ServiceM8 lacks a customer-facing messaging endpoint

4. **Session Management**: Token-based authentication with 24-hour expiry

---

## Database Schema

```sql
customers (id, email, phone, name, company_uuid, created_at)
sessions  (id, customer_id, token, created_at, expires_at)
messages  (id, job_uuid, customer_id, content, sender_type, created_at)
```

---

## Future Enhancements

| Priority | Enhancement |
|----------|-------------|
| High | WebSocket for real-time messaging |
| High | Pagination for large job lists |
| Medium | ServiceM8 Notes API integration for message sync |
| Medium | Push notifications for job updates |
| Low | Offline PWA support |

---

## AI Assistance Disclosure

This project was developed with AI assistance (Claude) for:
- Initial project scaffolding and boilerplate
- ServiceM8 API research and integration patterns
- Code generation for components and API routes
- Documentation drafting

All generated code was reviewed, tested, and refined to meet project requirements.

