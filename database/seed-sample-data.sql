-- ============================================
-- H&B Trade - Sample Data Seed Script
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. SAMPLE ORDERS (10 orders with various statuses)
INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, product_name, quantity, price, shipping_method, status, notes) VALUES
  (gen_random_uuid(), 'HB-2026-001', 'Rahim Uddin', 'rahim@email.com', '+8801712345678', 'iPhone 16 Pro Max', 5, 750000.00, 'air', 'processing', 'Customer wants express delivery'),
  (gen_random_uuid(), 'HB-2026-002', 'Fatima Akter', 'fatima@gmail.com', '+8801812345679', 'Samsung Galaxy S25 Ultra', 3, 450000.00, 'sea', 'guangzhou_warehouse', 'Bulk order for shop'),
  (gen_random_uuid(), 'HB-2026-003', 'Karim Hossain', 'karim@yahoo.com', '+8801912345680', 'T-Shirts Bulk Pack', 100, 125000.00, 'hand_carry', 'in_transit', 'Urgent delivery needed'),
  (gen_random_uuid(), 'HB-2026-004', 'Sadia Begum', 'sadia@hotmail.com', '+8801512345681', 'Cosmetics Set', 20, 85000.00, 'air', 'dhaka_customs', 'Beauty shop order'),
  (gen_random_uuid(), 'HB-2026-005', 'Jamal Ahmed', 'jamal@outlook.com', '+8801612345682', 'Electronic Accessories', 50, 175000.00, 'sea', 'pending', 'New inquiry'),
  (gen_random_uuid(), 'HB-2026-006', 'Nusrat Jahan', 'nusrat@mail.com', '+8801712345683', 'Kids Toys Collection', 30, 95000.00, 'air', 'delivered', 'Successfully delivered'),
  (gen_random_uuid(), 'HB-2026-007', 'Tanvir Islam', 'tanvir@gmail.com', '+8801812345684', 'Kitchen Appliances', 15, 320000.00, 'sea', 'dhaka_office', 'Ready for pickup'),
  (gen_random_uuid(), 'HB-2026-008', 'Mita Rahman', 'mita@yahoo.com', '+8801912345685', 'Fashion Items', 80, 210000.00, 'hand_carry', 'processing', 'Canton Fair purchase'),
  (gen_random_uuid(), 'HB-2026-009', 'Rafiqul Islam', 'rafiqul@hotmail.com', '+8801512345686', 'Mobile Phone Parts', 200, 145000.00, 'air', 'cancelled', 'Customer cancelled'),
  (gen_random_uuid(), 'HB-2026-010', 'Priya Das', 'priya@outlook.com', '+8801612345687', 'Home Decor Items', 40, 180000.00, 'sea', 'processing', 'Regular customer');

-- 2. SAMPLE PRODUCT REQUESTS (8 requests)
INSERT INTO product_requests (id, name, email, phone, product_name, product_link, quantity, specifications, message, status, image_url) VALUES
  (gen_random_uuid(), 'Abdul Karim', 'abdul@email.com', '+8801723456789', 'Wireless Earbuds', 'https://example.com/earbuds', 50, 'Bluetooth 5.3, Noise Cancellation', 'Need wholesale price quote', 'pending', NULL),
  (gen_random_uuid(), 'Salma Begum', 'salma@gmail.com', '+8801823456790', 'Smart Watch Band', 'https://example.com/watchband', 100, 'Silicone, Multiple Colors', 'For retail shop', 'processing', NULL),
  (gen_random_uuid(), 'Imran Hossain', 'imran@yahoo.com', '+8801923456791', 'LED Strip Lights', 'https://example.com/ledstrip', 200, 'RGB, 5m per roll', 'Interior decoration business', 'completed', NULL),
  (gen_random_uuid(), 'Nasrin Akter', 'nasrin@hotmail.com', '+8801523456792', 'Phone Cases', 'https://example.com/cases', 300, 'iPhone & Samsung models', 'Mobile accessory store', 'pending', NULL),
  (gen_random_uuid(), 'Faruk Ahmed', 'faruk@outlook.com', '+8801623456793', 'Power Bank 20000mAh', 'https://example.com/powerbank', 75, 'Fast charging, Type-C', 'Corporate gift order', 'processing', NULL),
  (gen_random_uuid(), 'Taslima Khatun', 'taslima@mail.com', '+8801723456794', 'USB-C Hub', 'https://example.com/hub', 60, '7-in-1, HDMI output', 'Office supplies', 'cancelled', NULL),
  (gen_random_uuid(), 'Rashed Khan', 'rashed@gmail.com', '+8801823456795', 'Bluetooth Speaker', 'https://example.com/speaker', 40, 'Portable, Waterproof', 'Event management', 'pending', NULL),
  (gen_random_uuid(), 'Shamima Parvin', 'shamima@yahoo.com', '+8801923456796', 'Laptop Stand', 'https://example.com/stand', 120, 'Adjustable, Aluminum', 'E-commerce inventory', 'processing', NULL);

-- 3. SAMPLE SERVICE REQUESTS (6 requests for different services)
INSERT INTO service_requests (id, service_type, name, phone, whatsapp, email, company, details, message, status, tracking_number, admin_notes, price) VALUES
  (gen_random_uuid(), 'product_sourcing', 'Mizanur Rahman', '+8801734567890', '+8801734567890', 'mizanur@email.com', 'Mizan Traders',
   '{"product_name":"Industrial Machine Parts","quantity":"10 units","specifications":"CNC parts for textile industry"}',
   'Looking for reliable supplier in Guangzhou area', 'received', 'SR20260519001', 'Contacted 3 suppliers', 250000.00),
  (gen_random_uuid(), 'wholesale_supply', 'Rehana Akter', '+8801834567891', '+8801834567891', 'rehana@gmail.com', 'Rehana Fashion House',
   '{"product_category":"Women\'s Clothing","quantity_range":"500+ pieces","budget_range":"$2000-$3000"}',
   'Need monthly wholesale supply', 'in_progress', 'SR20260519002', 'Negotiating prices', 150000.00),
  (gen_random_uuid(), 'air_cargo', 'Kamal Hossain', '+8801934567892', '+8801934567892', 'kamal@yahoo.com', 'Kamal Electronics',
   '{"cargo_description":"Electronic components","weight":"25 kg","dimensions":"40x30x25 cm","origin":"Shenzhen","destination":"Dhaka","preferred_date":"2026-05-25"}',
   'Urgent air shipment required', 'received', 'SR20260519003', NULL, NULL),
  (gen_random_uuid(), 'sea_shipping', 'Jannatul Ferdous', '+8801534567893', '+8801534567893', 'jannatul@hotmail.com', 'Ferdous Trading',
   '{"cargo_type":"Furniture","container_type":"FCL","weight":"2000 kg","volume":"28 CBM","origin_port":"Ningbo","destination_port":"Chittagong"}',
   'Full container shipment inquiry', 'in_progress', 'SR20260519004', 'Quote provided', 350000.00),
  (gen_random_uuid(), 'hand_carry', 'Sohel Rana', '+8801634567894', '+8801634567894', 'sohel@outlook.com', NULL,
   '{"item_description":"Important documents + small samples","value":"$500","urgency":"High","pickup_location":"Guangzhou Baiyun Airport"}',
   'Need within 72 hours', 'completed', 'SR20260519005', 'Delivered successfully', 8000.00),
  (gen_random_uuid(), 'canton_fair', 'Papia Islam', '+8801734567895', '+8801734567895', 'papia@mail.com', 'Papia Enterprises',
   '{"visit_date":"2026-04-15","assistance_type":"Full Guide + Translation","number_of_attendees":"2","language_preference":"Bengali + English"}',
   'First time visitor needs full support', 'received', 'SR20260519006', NULL, NULL);

-- 4. SAMPLE MESSAGES (12 messages from contact form)
INSERT INTO messages (id, name, email, subject, message, is_read, created_at) VALUES
  (gen_random_uuid(), 'Mohammad Ali', 'm.ali@email.com', 'Product Inquiry', 'I want to know about your sourcing services for electronics.', false, NOW() - INTERVAL '2 hours'),
  (gen_random_uuid(), 'Ruksana Begum', 'ruksana@gmail.com', 'Shipping Quote', 'Can you provide a quote for sea shipping of 500kg?', true, NOW() - INTERVAL '5 hours'),
  (gen_random_uuid(), 'Sakib Rahman', 'sakib@yahoo.com', 'Partnership Opportunity', 'We are interested in a long-term partnership.', false, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'Naznin Akter', 'naznin@hotmail.com', 'Order Status', 'I want to check my order status HB-2026-003.', true, NOW() - INTERVAL '1 day'),
  (gen_random_uuid(), 'Arif Chowdhury', 'arif@outlook.com', 'Wholesale Pricing', 'What are the wholesale rates for mobile accessories?', false, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'Tania Islam', 'tania@mail.com', 'Canton Fair Help', 'I need assistance during Canton Fair visit.', true, NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'Belayet Hossain', 'belayet@gmail.com', 'Custom Clearance', 'Do you handle customs clearance at Dhaka?', false, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'Shirin Sultana', 'shirin@yahoo.com', 'Payment Methods', 'What payment methods do you accept?', true, NOW() - INTERVAL '3 days'),
  (gen_random_uuid(), 'Emran Hossain', 'emran@hotmail.com', 'Air Cargo Rate', 'Please send air cargo rates to Dhaka.', false, NOW() - INTERVAL '4 days'),
  (gen_random_uuid(), 'Joya Parvin', 'joya@outlook.com', 'Product Quality', 'How do you ensure product quality?', true, NOW() - INTERVAL '5 days'),
  (gen_random_uuid(), 'Ripon Mia', 'ripon@mail.com', 'Hand Carry Service', 'Is hand carry service available this week?', false, NOW() - INTERVAL '6 days'),
  (gen_random_uuid(), 'Dipa Rani', 'dipa@gmail.com', 'Thank You', 'Thank you for excellent service on my last order!', true, NOW() - INTERVAL '7 days');

-- 5. SAMPLE TRACKING ENTRIES (for orders in transit)
INSERT INTO tracking (id, tracking_number, status, location, description, order_id) 
SELECT gen_random_uuid(), o.tracking_number, t.status, t.location, t.description, o.id
FROM (SELECT order_number as tracking_number, id FROM orders WHERE status IN ('in_transit', 'dhaka_customs', 'dhaka_office')) o
CROSS JOIN (VALUES
  ('guangzhou_warehouse', 'Guangzhou, China', 'Package received at warehouse, preparing for export'),
  ('in_transit', 'In Transit (China → Bangladesh)', 'Package departed Guangzhou, currently in transit'),
  ('dhaka_customs', 'Dhaka Customs, Bangladesh', 'Package arrived at Dhaka customs, undergoing clearance')
) AS t(status, location, description);

-- 6. SAMPLE STATUS HISTORY
INSERT INTO status_history (id, order_id, old_status, new_status, changed_by, notes)
SELECT gen_random_uuid(), o.id, 'pending', o.status, 'admin@hbtrade.com', 'Status updated'
FROM orders o WHERE o.status != 'pending';

-- ============================================
-- VERIFICATION QUERIES (Run these to confirm data was inserted)
-- ============================================

-- Check counts:
-- SELECT 'orders' as table_name, COUNT(*) FROM orders
-- UNION ALL SELECT 'product_requests', COUNT(*) FROM product_requests
-- UNION ALL SELECT 'service_requests', COUNT(*) FROM service_requests  
-- UNION ALL SELECT 'messages', COUNT(*) FROM messages
-- UNION ALL SELECT 'tracking', COUNT(*) FROM tracking;
