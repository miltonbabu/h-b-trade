-- H&B Trade Database Migration
-- This script adds missing fields to match backend logic and admin panel features
-- Run this AFTER the main schema.sql

-- ============================================
-- 0. STATUS HISTORY TABLE - Create if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id),
    tracking_number VARCHAR(100),
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    location VARCHAR(255),
    note TEXT,
    changed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 1. ORDERS TABLE - Add missing fields
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_info TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_link TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;

-- ============================================
-- 2. PRODUCTS TABLE - Add missing fields
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(50) UNIQUE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image2 VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image3 VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;

-- ============================================
-- 3. SETTINGS TABLE - Add missing fields
-- ============================================
ALTER TABLE settings ADD COLUMN IF NOT EXISTS wechat_qr VARCHAR(500);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS alipay_qr VARCHAR(500);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_logo VARCHAR(500);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS services_text TEXT;

-- ============================================
-- 4. TRACKING TABLE - Add missing fields
-- ============================================
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id);
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS estimated_date DATE;
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);

-- ============================================
-- 5. PRODUCT_REQUESTS TABLE - Add missing fields
-- ============================================
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS converted_to_order UUID REFERENCES orders(id);

-- ============================================
-- 6. Create additional indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_tracking_order_id ON tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_tracking ON product_requests(tracking_number);

-- ============================================
-- 7. Update existing products with product codes
-- ============================================
UPDATE products 
SET product_code = 'PROD-' || to_char(created_at, 'YYYYMMDD') || '-' || LPAD(id::text, 5, '0')
WHERE product_code IS NULL;

-- ============================================
-- 8. Add constraints for data integrity
-- ============================================
ALTER TABLE orders ALTER COLUMN customer_name SET NOT NULL;
ALTER TABLE products ALTER COLUMN name SET NOT NULL;
ALTER TABLE products ALTER COLUMN price SET NOT NULL;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this migration, your database will support:
-- ✓ Admin management (users table already exists)
-- ✓ Order management with customer info
-- ✓ Product management with multiple images
-- ✓ Tracking with order references
-- ✓ Settings with QR codes
-- ✓ Product requests with conversion tracking
