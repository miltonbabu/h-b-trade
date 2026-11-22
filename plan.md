# H&B Trade — Email Notification & Tracking System Plan (Resend)

> Goal: full transactional email coverage for every customer-facing flow (registration, orders, service requests for sea / air cargo / hand carry / others, contact messages, tracking status updates), plus admin alert emails for every website activity. Delivery via **Resend API**.

---

## 1. Current State (from codebase analysis)

| Area | Status |
|---|---|
| Tracking per service | ✅ Exists. `GET /api/track/:tracking_number` in `backend/routes/public.js` resolves across `orders`, `product_requests`, `service_requests`. Sea has dedicated status flow (`sea_received_warehouse` → `sea_delivered`). Tracking prefixes: `PS/WS/AC/SS/HC/CF` per service type. Admin tracking page exists (`frontend/src/app/admin/tracking/`). |
| Service request forms (sea/air/hand carry/…) | ✅ 6 service types in `frontend/src/app/services/[serviceType]/ServiceRequestForm.tsx` → `POST /api/service-request` → `service_requests` table. |
| Orders / product requests / contact / events | ✅ All flows exist (`POST /api/orders`, `/api/product-request`, `/api/contact`, `/api/event-registration`). |
| Customer registration | ✅ `POST /api/customer/register` (JWT, `customers` table). No welcome email, no verification. |
| Admin status updates | ✅ Admin can update order/request status + add tracking entries (`backend/routes/admin.js`). |
| Email today | ⚠️ **Only** invoice sending via nodemailer/SMTP (`POST /api/admin/send-invoice`). Everything else has **no email at all**. |
| Admin alerts | ❌ None. Only in-app badge counts (`GET /api/admin/notifications`). |

**Conclusion:** all business flows and tracking exist. What we are building is the **entire email layer on Resend** + hooking it into existing endpoints + a small admin settings/log UI.

---

## 2. Architecture

```
backend/
├── services/email/
│   ├── resendClient.js      # Resend API wrapper (fetch to https://api.resend.com/emails)
│   ├── templates.js         # HTML email templates (inline CSS, responsive)
│   └── dispatcher.js        # sendEmail() + logging + retry + fail-safe
├── services/notifications.js# Event → recipient/template mapping (called from routes)
```

- **Provider:** Resend via REST API (`POST https://api.resend.com/emails`, header `Authorization: Bearer RESEND_API_KEY`). Use the official `resend` npm package in backend.
- **Fail-safe:** emails are fire-and-forget per request — wrapped in `try/catch`, a failed email must **never** fail the user's API request. All attempts logged.
- **Logging:** new `email_log` table (who, what, status, resend id, error).
- **Config:** `settings` table gains email columns (from-name, admin notify email, per-category on/off toggles). Env vars for API key.

---

## 3. Email Trigger Matrix

### 3.1 Emails to CUSTOMER (progress updates "for every process")

| # | Trigger (existing endpoint) | Email | Content |
|---|---|---|---|
| C1 | `POST /api/customer/register` | **Welcome** | Greeting, login link, summary of services |
| C2 | `POST /api/orders` (cart checkout) | **Order Confirmation** | Order number, items, price, tracking number (if assigned), next steps |
| C3 | `POST /api/service-request` (sea/air/hand carry/…) | **Service Request Received** | Service type label, request id, **tracking number**, what happens next |
| C4 | `POST /api/product-request` | **Product Request Received** | Request summary, target price, tracking number |
| C5 | `POST /api/contact` | **Contact Auto-Reply** | "We received your message, reply within 24h", message copy |
| C6 | `POST /api/event-registration` | **Event Registration Confirmation** | Event title, registration details |
| C7 | Admin updates **order** status (`PUT /api/admin/orders/:id` status) | **Order Status Update** | New status (human label), location/note, tracking timeline link |
| C8 | Admin updates **service request** status (`PUT /api/admin/service-requests/:id`) | **Service Status Update** | Per-service status label (sea flow vs air/hand-carry flow), note |
| C9 | Admin updates **product request** status | **Request Status Update** | New status + note (e.g. quote ready) |
| C10 | Admin adds tracking entry (`POST /api/admin/tracking`) | **Tracking Update** | Status, location, carrier, note, estimated date |
| C11 | Admin sets price on product/service request | **Quote / Price Ready** | Price, payment methods (bkash/nagad/bank), approve CTA |
| C12 | Admin converts service/product request → order | **Converted to Order** | New order number + tracking number |
| C13 | `POST /api/admin/send-invoice` (migrate to Resend) | **Invoice** | PDF attachment (keep existing behavior, switch transport) |
| C14 | *(Phase 5, optional)* register/forgot password | **Email Verification / Password Reset** | Secure token link |

### 3.2 Emails to ADMIN (single inbox, e.g. `ADMIN_EMAIL`)

| # | Trigger | Email |
|---|---|---|
| A1 | New customer registration | **New Customer Signup** — name, email, phone, company |
| A2 | New order placed | **New Order** — order number, customer, items, total |
| A3 | New service request | **New Service Request** — service type, customer, details JSON summary, tracking number |
| A4 | New product request | **New Product Request** — product, target price, qty |
| A5 | New contact message | **New Contact Message** — subject, message, reply-to set to customer email |
| A6 | New event registration | **New Event Registration** — event, applicant, passport info summary |
| A7 | Service/product request converted to order | **Conversion Notice** |
| A8 | Email delivery failure (any customer email hard-fails) | **Delivery Failure Alert** (digest) |

> All admin emails use `reply_to` = customer's email so admin can hit "Reply" directly.

---

## 4. Database Changes

New table `email_log`:

```sql
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email VARCHAR(255) NOT NULL,
  from_email VARCHAR(255),
  reply_to VARCHAR(255),
  subject VARCHAR(500),
  category VARCHAR(50),          -- 'welcome','order_confirmation','status_update','admin_alert', ...
  recipient_type VARCHAR(20),    -- 'customer' | 'admin'
  related_type VARCHAR(50),      -- 'order','service_request','product_request','message','customer', ...
  related_id VARCHAR(100),
  status VARCHAR(20) DEFAULT 'queued',  -- 'queued','sent','failed'
  error TEXT,
  resend_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP
);
```

`settings` table additions (columns, matching existing pattern):

| Key | Purpose | Default |
|---|---|---|
| `email_from_name` | Sender name | `H&B Trade` |
| `admin_notification_email` | Where A1–A8 go | env `ADMIN_EMAIL` |
| `email_notifications_enabled` | Global kill switch | `true` |
| `notify_customer_status_updates` | Toggle C7–C10 | `true` |
| `notify_admin_new_activity` | Toggle A1–A6 | `true` |

(Implement in `backend/config/database.js` dual-mode auto-create logic + `database/supabase-schema.sql` + new `database/migration-email.sql`.)

---

## 5. Environment Variables (Resend)

Add to `backend/.env.example`, `.env.production.example`, `.env.supabase.example`:

```env
# Resend Email Service
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM="H&B Trade <noreply@yourdomain.com>"   # must be a Resend-verified domain
ADMIN_EMAIL=admin@yourdomain.com
EMAIL_ENABLED=true
```

> ⚠️ Resend requires **domain verification** (SPF/DKIM DNS records) before sending from a custom domain. Free tier allows `onboarding@resend.dev` for testing only.

---

## 6. Implementation Phases

### Phase 1 — Email core (Resend) — foundation
1. `npm install resend` in `backend/`.
2. `backend/services/email/resendClient.js` — thin wrapper over Resend SDK, reads `RESEND_API_KEY`, `EMAIL_FROM`.
3. `backend/services/email/templates.js` — responsive HTML templates (header with logo from `settings`, footer with company address/whatsapp from `settings`, inline CSS). Templates: `welcome`, `orderConfirmation`, `orderStatusUpdate`, `serviceRequestReceived`, `serviceStatusUpdate`, `productRequestReceived`, `productStatusUpdate`, `quoteReady`, `contactAutoReply`, `eventRegistration`, `trackingUpdate`, `convertedToOrder`, `adminAlert` (generic admin wrapper), `invoice` (attachment support).
4. `backend/services/email/dispatcher.js` — `sendEmail({to, subject, template, data, category, recipientType, relatedType, relatedId, replyTo, attachments})`:
   - checks `email_notifications_enabled` / category toggles
   - renders template → sends via Resend
   - writes `email_log` row (queued → sent/failed), retry once on network error
   - never throws to caller
5. DB migration: `email_log` table + settings columns (update `backend/config/database.js` AND `database/supabase-schema.sql` + new `database/migration-email.sql`).

### Phase 2 — Customer lifecycle emails
6. `backend/routes/customer.js` `POST /register` → C1 welcome + A1 admin alert.
7. `backend/routes/public.js`:
   - `POST /api/orders` → C2 + A2
   - `POST /api/service-request` → C3 (with generated tracking number) + A3
   - `POST /api/product-request` → C4 + A4
   - `POST /api/contact` → C5 + A5
   - `POST /api/event-registration` → C6 + A6
8. `backend/services/notifications.js` — single place mapping events to emails (routes call one-liners like `notify.newServiceRequest(req, sr)`).

### Phase 3 — Tracking & status update emails (core ask)
9. `backend/routes/admin.js`:
   - Order status change → C7 (include tracking timeline summary + public tracking link `${FRONTEND_URL}/tracking?tn=...`)
   - Service request status change → C8 (status label maps: sea flow vs air/hand-carry flow — reuse label maps from `frontend/src/app/tracking/page.tsx` and `services/track/page.tsx`, centralize shared constants)
   - Product request status change → C9; price set → C11
   - `POST /api/admin/tracking` (new tracking entry) → C10
   - `POST /api/admin/service-requests/:id/convert-to-order` (and product equivalent) → C12 + A7
   - `POST /api/admin/send-invoice` → migrate nodemailer/SMTP → Resend (C13), keep PDF attachment
10. Status label registry on backend (`backend/services/email/statusLabels.js`): mapping status value → human label for both generic and sea-specific flows, so emails show "Container Loading" not `sea_container_loading`.

### Phase 4 — Admin email settings + observability UI
11. `backend/routes/admin.js` (settings routes): GET/PUT email settings (from name, admin email, toggles); GET `email_log` (paginated, filter by status/category).
12. Frontend:
    - `frontend/src/app/admin/settings/page.tsx` — add "Email Notifications" card (from name, admin notify email, toggles, send test email button).
    - New `frontend/src/app/admin/emails/page.tsx` — email log table (recipient, subject, category, status, time, error) + sidebar entry in `frontend/src/app/admin/layout.tsx`.
    - `frontend/src/types/index.ts` — `EmailLog`, `EmailSettings` interfaces.
13. `POST /api/admin/email/test` — send test email to verify Resend config.

### Phase 5 — Account emails (optional but recommended)
14. Email verification on signup (token table + verify page) — C14.
15. Forgot / reset password flow (`/api/customer/forgot-password`, `/reset-password`) — both customer and admin users.

### Phase 6 — Hardening & deploy
16. Retry/backoff, bounce handling (optional Resend webhook → mark `email_log` bounced), rate limiting per recipient.
17. Docs: update `README.md`, `.env` examples; verify DNS (SPF/DKIM) for the sending domain; test on Render staging.

---

## 7. Key Files Touched

| File | Change |
|---|---|
| `backend/package.json` | + `resend` dependency |
| `backend/services/email/*` (new) | client, templates, dispatcher |
| `backend/services/notifications.js` (new) | event → email mapping |
| `backend/config/database.js` | `email_log` table + settings columns (PG + SQLite paths) |
| `backend/routes/customer.js` | register → welcome + admin alert |
| `backend/routes/public.js` | orders / service-request / product-request / contact / event-registration → emails |
| `backend/routes/admin.js` | status updates, tracking add, convert-to-order, send-invoice (Resend), email settings + log endpoints |
| `backend/.env*.example` | `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `EMAIL_ENABLED` |
| `database/supabase-schema.sql` + `database/migration-email.sql` (new) | schema |
| `frontend/src/app/admin/settings/page.tsx` | email settings UI |
| `frontend/src/app/admin/emails/page.tsx` (new) | email log viewer |
| `frontend/src/app/admin/layout.tsx` | sidebar link |
| `frontend/src/types/index.ts` | `EmailLog`, `EmailSettings` |

---

## 8. Email Template Design Notes

- Mobile-responsive, table-based HTML with inline CSS (email-client safe).
- Header: company logo + name from `settings`; Footer: office address, phone, WhatsApp link, Facebook.
- Every customer email includes a **"Track your order"** button → `${FRONTEND_URL}/tracking?tn=<tracking_number>`.
- Status update emails include the **full progress timeline** (completed steps ✓, current step highlighted, future steps grey) reusing the same status sequences the tracking page uses (sea-specific sequence for `sea_shipping`, generic for air/hand-carry/others).
- Admin alert emails: compact one-screen summary with an "Open in Admin Panel" button.

---

## 9. Acceptance Criteria

1. New user signup → receives welcome email within seconds; admin receives "New Customer" alert.
2. Placing an order / submitting a sea, air cargo, hand carry (or any) service request → customer gets confirmation **with tracking number**; admin gets alert with details.
3. Admin changes any order/service/product request status → customer receives status email with updated timeline; failure does not break the admin request.
4. Admin adds a tracking entry → customer gets tracking update email.
5. Contact form → customer gets auto-reply; admin gets message alert with reply-to.
6. Invoice sending works through Resend (PDF attached).
7. Admin can configure from-name, admin notification email, and toggle email categories in Settings; can view email log with sent/failed status.
8. All emails logged in `email_log`; no email failure causes an API error.
9. `EMAIL_ENABLED=false` silently disables all sending (for dev).

---

## 10. Risks & Notes

- **Resend domain verification** required before production sending (DNS SPF/DKIM). Plan for a verified domain (e.g. `mail.hbtrade.com`).
- Invoice sending currently uses SMTP/nodemailer → migrate to Resend to keep a single email path (keep SMTP only as emergency fallback if desired; default: Resend only).
- Status value sets differ (sea vs generic); emails must use the correct per-service status sequence — centralize in `statusLabels.js` to avoid drift with frontend.
- Dev mode (SQLite) must also create `email_log` (mirrored in `config/database.js` dual-mode logic).
- Rate limit: Resend free tier = 100 emails/day, 2/sec — queue bursts (e.g. bulk status updates) via simple in-process queue if needed.

---

## 11. Suggested Execution Order (when we start)

1. Phase 1 (email core + DB) → 2. Phase 3 (status/tracking emails — the core business ask) → 3. Phase 2 (lifecycle emails) → 4. Phase 4 (admin UI) → 5. Phase 5/6 as needed.

Each phase is independently testable (send test email endpoints + manual form submissions in dev).
