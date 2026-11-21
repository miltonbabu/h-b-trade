# Sea Shipment Tracking Implementation Plan

## Summary

Add a sea-specific order lifecycle and tracking experience for both sea shipment service requests converted to orders and sea-shipping orders created directly by an admin. Admins will be able to select sea stages and record a date/time for each update. Customers will see a sea progress bar instead of air-cargo stages, with the supported order fields (including quantity, net weight, price, and notes) displayed on the tracking page.

## Current State Analysis

- `frontend/src/app/admin/orders/page.tsx` has one shared order form with customer name, product name, quantity, shipping method, price, net weight, notes, status, and tracking number. Its status options are shared and air-oriented (`guangzhou_warehouse`, `in_transit`, `dhaka_customs`, etc.). The form sends notes on create, but the `POST /orders` handler in `backend/routes/admin.js` currently does not persist notes or create a tracking event.
- `backend/routes/admin.js` defines a global order status sequence and validates updates against that fixed set. A changed status creates `status_history` and `tracking` rows; the event timestamp is currently generated at update time. Direct-created sea orders currently start with the selected status but have no initial tracking event.
- The same backend route converts service requests to orders, preserving request details in `items_info` and the tracking number. Sea requests currently default to the shared `processing` status; conversion does not create an initial tracking row.
- `backend/routes/public.js` returns an order's number, customer, product, quantity, shipping method, status, tracking number, price, and creation date, but omits `net_weight` and `notes`. It builds the same shared status list for every order type.
- `frontend/src/app/tracking/page.tsx` renders `data.allStatuses` with a shared status configuration that labels `in_transit` as Flying and uses a plane icon. The order details omit net weight, price, and notes. The tracking history already displays each event's date/time.
- `database/schema.sql` has `orders.status` as a string and a `tracking` table with status, location, note, and `created_at`. The existing schema can represent sea stage history; no new table is needed. Verify database driver support for inserting an explicit tracking timestamp before implementation; otherwise add an optional event timestamp using the existing database date handling.

## Proposed Changes

### 1. Define a distinct sea shipment lifecycle

**File:** `backend/routes/admin.js`

- Define sea stage values and labels corresponding to the requested flow:
  1. `sea_received_warehouse` — Received at the warehouse
  2. `sea_container_loading` — Container loading
  3. `sea_in_transit` — In transit
  4. `sea_chittagong_port` — Chittagong port
  5. `sea_chittagong_customs` — Chittagong customs
  6. `sea_customs_released` — Customs released
  7. `sea_dhaka_office` — Dhaka office
  8. `sea_delivered` — Delivered to customer
- Keep `cancelled` available for either shipping method.
- Treat the above values as the sea order's full progress sequence; keep existing statuses/sequence unchanged for air and other orders.
- Select sequence and transition validation by `shipping_method` (accept the current `sea-shipping` form value and normalized sea identifier used by converted service requests, `sea_shipping`).
- When a sea order's status is updated, write the selected stage to the existing order, status history, and tracking tables, with the chosen location/note and selected event timestamp.
- For create and service-request conversion, ensure the sea order has a valid sea stage and create its initial tracking event so the timeline has a dated first step. Do not generate unrelated tracking history for non-sea orders.
- Persist the direct create form's `notes` field, which is currently omitted from its insert.

### 2. Update admin order entry and updates

**File:** `frontend/src/app/admin/orders/page.tsx`

- When shipping method is Sea Shipping, replace the shared air-oriented status choices in the modal and quick status update control with the sea lifecycle choices.
- Add a date/time input for a sea status update, defaulted to the current local time when editing/updating; send it with the selected stage. Backend stores that timestamp as the event time. Do not require admins to select a future date/time.
- Preserve current fields (name, product/cargo description, quantity, tracking number, net weight, notes, price, and status). Save Notes on create as well as edit.
- Show sea-specific stage labels, not raw enum keys, in order list/status views.

**File:** `backend/routes/admin.js`

- Validate sea status updates according to the order's shipping method, while retaining the existing accepted status flow for all other orders.
- Allow create payloads to set a valid initial sea stage and its initial tracking entry; continue generating the order number and preserve existing validation/security patterns.

### 3. Make service-request conversion initialize sea tracking correctly

**Files:** `backend/routes/admin.js`, `frontend/src/app/admin/service-requests/page.tsx`

- Ensure conversion of a `sea_shipping` request creates an order with a sea lifecycle status and an initial tracking event using the original tracking number.
- Keep existing copied customer details, cargo data in `items_info`, quoted price, quantity, and request-to-order association.
- Ensure the service-request conversion UI presents a sea-appropriate initial status when the request is sea shipping and does not offer air-only progression for it. Keep existing defaults for other service types.

### 4. Return complete tracking data and method-specific stages

**File:** `backend/routes/public.js`

- Include `net_weight` and `notes` in the order lookup projection (and any other existing order fields needed by the tracking page, such as price).
- Return `allStatuses` based on `shipping_method`: sea orders receive the sea stage list, and non-sea orders keep the current list.
- Add sea stage status labels/descriptions in `STATUS_INFO` for tracking-history entries.
- For sea orders, mark the active step and prior steps from the current order status while preserving per-step timestamps from tracking history.

**File:** `frontend/src/app/tracking/page.tsx`

- Add sea stage icons/labels, using a ship icon for the sea in-transit stage.
- Use the API-provided sea status sequence for sea orders so the progress indicator no longer shows Flying / Air Cargo stages.
- Display order quantity, net weight, price, and notes when present; keep optional values omitted or shown as `N/A` consistently with the existing details layout.
- Render date and time for completed/current sea steps from their tracking events; pending future stages remain undated. Keep detailed tracking history with date/time.

### 5. Verify request/order tracking compatibility

**Files:** `backend/routes/public.js`, `frontend/src/app/tracking/page.tsx`

- Confirm converted sea orders are returned as `type: 'order'` and resolve the same tracking number to the order after conversion.
- Keep direct service-request lookup behavior before conversion unchanged. If existing API response type for a service request does not match the tracking UI's expected property, correct that contract only if it prevents the pre-conversion service request from rendering.

## Assumptions & Decisions

- Sea-shipment order progress is exactly the eight requested stages, in the listed order, plus cancellation. The generic `pending`/`processing` stages are not inserted into the sea progress bar; the initial sea stage is **Received at the warehouse**.
- The sea process step uses a ship icon. Other steps use existing Lucide icons where suitable.
- Admin-selected event date/time is optional and defaults to the current local time; the API persists the submitted timestamp, and tracking displays it in the app's existing local date/time formatting.
- Existing `tracking` rows are the source of per-stage timestamps. No schema migration is planned unless current database layer cannot persist an explicit timestamp.
- Keep the current direct-order field set. This task adds sea workflow/status tracking, not additional port/container/customs data-entry fields.
- The tracking and update logic must recognize both the UI's `sea-shipping` value and the service request's `sea_shipping` identifier as sea shipment, without changing unrelated order behavior.

## Verification

1. Run backend tests/lint/type checks available in the repository after changes.
2. Run frontend type-check/build and relevant lint/tests.
3. Create a Sea Shipping order in admin; verify Notes are saved, initial sea status/history exists, and sea-specific status/date-time can be updated.
4. Convert a sea-shipping service request; verify original tracking number and cargo details remain linked, with sea initial status/history.
5. Track both kinds of sea orders publicly; verify the sea progress order and ship icon, event timestamps, and quantity/net weight/price/notes display.
6. Verify an Air Cargo order retains the current air stages and Flying label/icon, and that non-sea order creation/update behavior is unchanged.
