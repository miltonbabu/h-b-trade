# Services Backend & Tracking System - Implementation Plan

## Summary

Add full backend and database support for the "Our Services" section. Each of the 6 services (Product Sourcing, Wholesale Supply, Air Cargo, Sea Shipping, Hand Carry, Canton Fair) will have its own dedicated request form. Service requests will have their own tracking pipeline separate from orders. Admins can manage service requests and convert them to orders when needed.

## Current State Analysis

* **Services page** (`frontend/src/app/services/page.tsx`): Completely static, hardcoded 6 services with no backend interaction

* **Existing product\_requests table**: Only handles product sourcing, not other services

* **Existing orders table**: Has a 7-step shipping pipeline (pending -> processing -> guangzhou\_warehouse -> in\_transit -> dhaka\_customs -> dhaka\_office -> delivered)

* **Existing tracking system**: Tied to the order pipeline with shipping-specific statuses

* **Admin panel**: Has pages for orders, requests, tracking, products, messages, videos, settings, admins, analytics

* **Database**: Dual-driver (SQLite dev / PostgreSQL prod) with unified `db.query()`, `db.run()`, `db.getOne()`, `db.getMany()` API

## Proposed Changes

### 1. Database: New `service_requests` table

**File:** `backend/config/database.js` (add to both `initPostgresTables` and `initSqliteTables`)

```sql
CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY,
  service_type VARCHAR(50) NOT NULL,        -- 'product_sourcing', 'wholesale_supply', 'air_cargo', 'sea_shipping', 'hand_carry', 'canton_fair'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  details TEXT,                              -- JSON string with service-specific fields
  message TEXT,
  status VARCHAR(50) DEFAULT 'received',     -- 'received', 'in_progress', 'completed', 'cancelled'
  tracking_number VARCHAR(50),
  admin_notes TEXT,
  price DECIMAL(10,2),
  converted_order_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Service-specific fields stored in** **`details`** **JSON:**

* **Product Sourcing:** product\_name, product\_link, quantity, specifications

* **Wholesale Supply:** product\_category, quantity\_range, budget\_range

* **Air Cargo:** cargo\_description, weight, dimensions, origin, destination, preferred\_date

* **Sea Shipping:** cargo\_type, container\_type (FCL/LCL), weight, volume, origin\_port, destination\_port

* **Hand Carry:** item\_description, value, urgency, pickup\_location

* **Canton Fair:** visit\_date, assistance\_type, number\_of\_attendees, language\_preference

### 2. Backend: Service Request API Routes

**File:** `backend/routes/public.js` (add new routes)

| Method | Endpoint                                      | Description                                         |
| ------ | --------------------------------------------- | --------------------------------------------------- |
| POST   | `/api/service-request`                        | Submit a service request (public)                   |
| GET    | `/api/service-request/track/:tracking_number` | Track a service request by tracking number (public) |

**File:** `backend/routes/admin.js` (add new routes)

| Method | Endpoint                                           | Description                                     |
| ------ | -------------------------------------------------- | ----------------------------------------------- |
| GET    | `/api/admin/service-requests`                      | List all service requests (with filters)        |
| GET    | `/api/admin/service-requests/:id`                  | Get a single service request                    |
| PUT    | `/api/admin/service-requests/:id`                  | Update a service request (status, notes, price) |
| DELETE | `/api/admin/service-requests/:id`                  | Delete a service request (super\_admin only)    |
| POST   | `/api/admin/service-requests/:id/convert-to-order` | Convert a service request to an order           |

### 3. Service Request Status Pipeline (Separate from Orders)

```
received -> in_progress -> completed
                       \-> cancelled
```

* **received**: Initial status when customer submits

* **in\_progress**: Admin is working on the request

* **completed**: Service fulfilled

* **cancelled**: Request cancelled

Each status transition creates a tracking entry in the existing `tracking` table using the service request's tracking number (format: `SR` + 10-digit timestamp).

### 4. Frontend: Service-Specific Request Forms

**New file:** `frontend/src/app/services/[serviceType]/page.tsx` - Dynamic route for each service's request form

Each service form will:

* Pre-populate the service type

* Show service-specific fields (stored in `details` JSON)

* Include common fields: name, email, phone, whatsapp, company, message

* Submit to `POST /api/service-request`

* Show tracking number on success

### 5. Frontend: Service Request Tracking Page

**New file:** `frontend/src/app/services/track/page.tsx` - Public tracking page for service requests

* User enters tracking number (SR format)

* Shows service request details, current status, progress bar

* Shows timeline of status changes

### 6. Frontend: Update Services Page

**File:** `frontend/src/app/services/page.tsx`

* Add "Request This Service" button on each service card

* Link each button to `/services/[serviceType]` request form

* Add "Track Your Service Request" link in CTA section

### 7. Frontend: Admin Service Requests Page

**New file:** `frontend/src/app/admin/service-requests/page.tsx`

* List all service requests with filters (status, service\_type)

* View details of each request

* Update status (received -> in\_progress -> completed/cancelled)

* Add admin notes and price

* Convert to order button

* Delete (super\_admin only)

### 8. Frontend: Update Admin Dashboard & Notifications

**File:** `frontend/src/app/admin/dashboard/page.tsx`

* Add service requests count to dashboard stats

* Show recent service requests

**File:** `backend/routes/admin.js` (notifications endpoint)

* Add pending service requests count to notifications

### 9. Frontend: Update Admin Sidebar

**File:** `frontend/src/app/admin/layout.tsx`

* Add "Service Requests" menu item in admin sidebar

### 10. Frontend Types

**File:** `frontend/src/types/index.ts`

Add new types:

```typescript
export interface ServiceRequest {
  id: string;
  service_type: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  details?: string; // JSON string
  message?: string;
  status: string;
  tracking_number?: string;
  admin_notes?: string;
  price?: number;
  converted_order_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestFormData {
  service_type: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email: string;
  company?: string;
  details?: Record<string, string>;
  message?: string;
}
```

## Files to Create/Modify Summary

| File                                               | Action | Purpose                                           |
| -------------------------------------------------- | ------ | ------------------------------------------------- |
| `backend/config/database.js`                       | Modify | Add `service_requests` table creation             |
| `backend/routes/public.js`                         | Modify | Add public service request & tracking endpoints   |
| `backend/routes/admin.js`                          | Modify | Add admin service request CRUD + convert-to-order |
| `frontend/src/types/index.ts`                      | Modify | Add ServiceRequest types                          |
| `frontend/src/app/services/page.tsx`               | Modify | Add "Request" buttons to each service card        |
| `frontend/src/app/services/[serviceType]/page.tsx` | Create | Dynamic service request form page                 |
| `frontend/src/app/services/track/page.tsx`         | Create | Public service request tracking page              |
| `frontend/src/app/admin/service-requests/page.tsx` | Create | Admin service requests management page            |
| `frontend/src/app/admin/layout.tsx`                | Modify | Add sidebar menu item                             |
| `frontend/src/app/admin/dashboard/page.tsx`        | Modify | Add service request stats                         |

## Assumptions & Decisions

1. **Service-specific fields in JSON**: Using a `details` JSON column avoids creating 6 different tables for each service type. The frontend forms will handle service-specific fields and serialize them.
2. **Separate tracking pipeline**: Service requests use a simpler 4-status pipeline (received/in\_progress/completed/cancelled) vs. the 7-step order pipeline.
3. **Tracking number format**: `SR` + 10-digit timestamp (e.g., SR1234567890) to distinguish from product requests (PR) and orders (TRK).
4. **Convert to order**: When a service request needs shipping, admin can convert it to an order, which then follows the full order tracking pipeline.
5. **Existing product request form**: The existing `/product-request` page remains unchanged. It serves the "Product Sourcing" service specifically. The new service request forms complement it.
6. **No user authentication required**: Service requests are public, just like product requests. Customers track via tracking number.

## Verification Steps

1. Submit a service request from each service type form - verify data saved to database
2. Track a service request using the tracking number - verify status display
3. Admin: view, filter, update status of service requests
4. Admin: convert a service request to an order - verify order created with correct data
5. Admin: delete a service request (super\_admin only)
6. Verify dashboard shows service request counts
7. Verify notifications include pending service requests
8. Test on both SQLite (dev) and verify SQL compatibility with PostgreSQL

