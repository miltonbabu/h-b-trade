# Shipping Services and Admin Order Guide

## Scope

This guide describes the current implementation of Hand Carry, Air Cargo, and Sea Shipping service requests and orders in this repository. It distinguishes customer service-request forms from orders created directly by an admin.

## The two workflows

### Customer submits a service request

1. The customer opens the relevant service form: `/services/air-cargo`, `/services/sea-shipping`, or `/services/hand-carry`.
2. They provide their contact details, shipment-specific details, sender/warehouse details, and optionally images and a message.
3. The request is stored as a service request with a tracking number and status. Admins can review it under **Admin > Service Requests**, edit its status, add notes and a quoted price, and convert it to an order.
4. Conversion creates an order, retains the request's tracking number, copies the service details into the order's `items_info`, and marks the service request completed. The resulting order can be managed under **Admin > Orders** and uses the order tracking flow.

### Admin directly creates a new order

1. The admin opens **Admin > Orders > New Order**.
2. The admin enters the order fields listed below and chooses Create.
3. The backend creates an order number and saves the entered fields. This route does not create a service request and does not collect the service form's detailed cargo fields.

## Customer service form components and fields

All three forms share these contact fields:

- Name (required)
- Email (required)
- Phone
- WhatsApp
- Company
- Additional message
- Product/cargo images (optional, up to 4 images, maximum 6 MB each)

They also share a **Sender & Warehouse Details** section:

- Sender name (required)
- Sender phone
- Sender address / pickup location (required)
- Supplier tracking code
- Delivery warehouse (required): Guangzhou Baiyun, Guangzhou Pazhou, Yiwu, Shenzhen, or Dhaka

The chosen warehouse displays its stored address and contact details. The customer can copy those details. These sender and warehouse fields are submitted as request details.

### Air Cargo fields

- Cargo description (required)
- Packaging type (required): carton/box, bag/sack, pallet, wooden crate, drum/barrel, case, or other
- Total number of packs (required)
- Weight per pack
- Total actual weight
- Pack dimensions (L × W × H in cm)
- Volume weight
- Cargo value (BDT)
- HS code, if known
- Origin airport
- Destination airport
- Preferred shipping date

### Sea Shipping fields

- Cargo description (required)
- Cargo type (required)
- Container type: FCL 20 ft, FCL 40 ft, FCL 40 ft high cube, or LCL
- Packaging type (required): carton/box, bag/sack, pallet, wooden crate, drum/barrel, case, or other
- Total number of packs
- Weight per pack
- Total gross weight
- Pack dimensions (L × W × H in cm)
- Total volume (CBM)
- Cargo value (BDT)
- HS code, if known
- Origin port
- Destination port
- Incoterm: EXW, FOB, CIF, or DDP

### Hand Carry fields

- Item description (required)
- Number of items
- Total weight
- Package dimensions (L × W × H in cm)
- Declared value (BDT)
- Urgency: urgent (1–2 days), express (3–5 days), or standard (5–7 days)
- Pickup location
- Delivery location

The delivery estimates shown on the service page/form are service descriptions, not a recorded shipment schedule or guaranteed delivery date.

## What the admin can do with a service request

In **Admin > Service Requests**, the admin can:

- Filter and search requests by service type/status and view their details and tracking history.
- Change request status through Received, In Progress, Completed, or Cancelled.
- Save admin notes and a price/quote.
- Edit request details.
- Convert the request into an order.

When converting, the form seeds the shipping method from the service type (Air Cargo, Sea Shipping, or Hand Carry) and seeds the price from declared/cargo value, budget/target price, or the admin's saved request price when available. The admin can change the price and shipping method before conversion.

The conversion creates an order number, carries across customer contact information, derives the product name from the request's cargo/item description, carries over quantity if available, copies request details into read-only order details (`items_info`), and retains the original tracking number. The converted order's initial status is Processing. A converted request cannot be converted again.

## Admin-created New Order form: fields to fill

The current **Admin > Orders > New Order** form contains:

| Field | Required by form/backend? | Notes |
| --- | --- | --- |
| Customer Name | Yes | Backend rejects a blank value. |
| Product Name | Yes | For freight orders, use a concise cargo/item description, for example “Textile samples” or “Machine parts”. |
| Quantity | No | Free-text value, e.g. “12 cartons” or “1 pallet”. |
| Price (BDT) | No | Order price/amount. |
| Net Weight (kg) | No | Numeric value. |
| Tracking Number | No | Can be supplied by the admin; status changes can generate one if absent. |
| Notes | No | Free-text order notes. |
| Shipping Method | No | Air Cargo, Sea Shipping, or Hand Carry. |
| Status | No | Defaults to Pending; options include Processing, Guangzhou Warehouse, Flying, Dhaka Customs, Dhaka Office, Delivered, and Cancelled. |

The order number is generated by the backend. Customer email, phone, origin/destination airports or ports, cargo type, packaging, pack count, dimensions, volume/CBM, HS code, Incoterm, sender/pickup details, and warehouse are **not fields on this direct New Order form**. The direct create endpoint also does not accept or save the form's Notes value, although Notes is displayed in the UI; it does save customer name, product name, quantity, shipping method, price, net weight, status, and tracking number.

## Current progress and limitations

- Air Cargo, Sea Shipping, and Hand Carry have dedicated customer service request forms with the fields listed above.
- Admin service-request management exists, including review, status updates, notes/price, edit, tracking history, and conversion to orders.
- Conversion retains the submitted service details in the order's read-only Original Request Details section and keeps the tracking number.
- Direct admin-created orders support only the simpler field set in the table above. Selecting Air Cargo or Sea Shipping sets only the shipping-method label; it does not open extra cargo fields or populate cargo specifications.
- Admin order creation currently has no dedicated origin/destination, freight dimensions/volume, container/airport/port, sender/warehouse, or cargo-value fields.
- Service-request conversion writes the request details into `items_info`, but the Orders edit form displays those details read-only. To correct source data, edit the original service request before conversion.
- Verify shipment-specific information and agreed charges with the customer before confirming a shipment. The app records entered information; it does not calculate freight rates or validate customs requirements.

## Practical checklist for a direct admin-created shipment order

Because the direct New Order form is limited, fill what it supports and put any additional cargo logistics information in Notes (bearing in mind the current create endpoint does not persist Notes). For full structured cargo information, use the corresponding customer service request and convert it to an order, or collect the cargo details outside this form and confirm them before processing.

At minimum, confirm the customer name, cargo/product description, quantity/package count, agreed price, net weight when known, correct shipping method, current status, and tracking number if one has been assigned. For operational handoff, also confirm customer contact details, origin and destination, package dimensions and gross/chargeable weight or CBM, cargo type and value, HS code if available, sender/pickup information, delivery warehouse, and any applicable container type/Incoterm. These latter details are not currently structured inputs in the direct New Order form.

## Code locations

- Customer service form fields and submission: `frontend/src/app/services/[serviceType]/ServiceRequestForm.tsx`
- Admin service request review and conversion UI: `frontend/src/app/admin/service-requests/page.tsx`
- Admin direct order form: `frontend/src/app/admin/orders/page.tsx`
- Admin order create/update and service request conversion APIs: `backend/routes/admin.js`
