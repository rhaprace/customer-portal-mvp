# Technical Notes - Customer Portal MVP

## What Was Built

A customer-facing portal that allows ServiceM8 customers to:

| Feature | Description |
|---------|-------------|
| **Authentication** | Login with email + phone number (verified against ServiceM8 contacts) |
| **Booking List** | View all jobs linked to customer's company |
| **Booking Details** | Access job information, status, address, and invoice amount |
| **File Attachments** | View photos and documents attached to jobs |
| **Messaging** | Send messages to service provider (persisted locally) |

### Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| Frontend | Next.js 16, TypeScript, Tailwind | Type safety, fast development, modern React patterns |
| Backend | Express.js | Lightweight, flexible, quick to scaffold |
| Database | SQLite | Zero-config, portable, no external dependencies |
| API | ServiceM8 REST | Direct integration with existing business data |

---

## Reasoning Behind Approach

| Assumption | Implementation | Rationale |
|------------|----------------|-----------|
| **Customer Identity** | Email + phone verification against ServiceM8 contacts | No dedicated customer auth in ServiceM8; dual-factor provides basic security without passwords |
| **Data Isolation** | Filter jobs by `company_uuid` | Ensures customers only see their own bookings; prevents cross-tenant data exposure |
| **Local Messaging** | SQLite persistence for messages | ServiceM8 lacks customer-facing messaging API; local storage enables feature without external dependency |
| **Session Duration** | 24-hour token expiry | Balances security with usability for typical customer portal usage patterns |
| **Phone Format** | Strip non-digits for comparison | Handles variations (spaces, dashes, parentheses) in user input vs stored data |
| **Mock Fallback** | Automatic switch based on API key presence | Enables development/testing without live API credentials |

### ServiceM8 API Usage

| Endpoint | Used For |
|----------|----------|
| `GET /companycontact.json` | Find customer by email during login |
| `GET /company/{uuid}.json` | Get company details (name, phone) |
| `GET /job.json?$filter=company_uuid eq '{uuid}'` | Fetch customer's bookings |
| `GET /attachment.json?$filter=related_object_uuid eq '{job_uuid}'` | Get job attachments |

**Why these endpoints?** ServiceM8 structures data around companies (customers) and jobs (bookings). The `company_uuid` relationship links customers to their jobs, enabling secure data isolation.

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

