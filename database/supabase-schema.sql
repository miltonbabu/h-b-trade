-- H&B Trade Schema for Supabase (COMPLETE - Updated 2026)
-- WITHOUT RLS - For backend API use
-- Copy ALL of this and paste into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Admin Authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    tracking_number VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_info TEXT,
    product_name VARCHAR(500) NOT NULL,
    product_link TEXT,
    product_codes VARCHAR(500),
    items_info TEXT,
    quantity VARCHAR(100),
    shipping_method VARCHAR(100),
    price DECIMAL(10, 2),
    net_weight VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    estimated_delivery DATE,
    payment_info TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. PRODUCT REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS product_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    product_name VARCHAR(500) NOT NULL,
    product_link TEXT,
    target_price VARCHAR(100),
    quantity VARCHAR(100),
    packaging_type VARCHAR(100),
    pack_quantity VARCHAR(100),
    master_pack_quantity VARCHAR(100),
    pack_dimensions VARCHAR(100),
    weight_per_pack VARCHAR(100),
    sample_needed VARCHAR(50),
    shipping_method VARCHAR(100),
    specifications TEXT,
    message TEXT,
    image VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    converted_to_order UUID REFERENCES orders(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. SERVICE REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS service_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    details TEXT,
    message TEXT,
    status VARCHAR(50) DEFAULT 'received',
    tracking_number VARCHAR(50),
    admin_notes TEXT,
    price DECIMAL(10, 2),
    converted_order_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. TRACKING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(100) NOT NULL,
    order_id UUID REFERENCES orders(id),
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    carrier VARCHAR(100),
    note TEXT,
    estimated_date DATE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL,
    tracking_number VARCHAR(100),
    old_status VARCHAR(100),
    new_status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    note TEXT,
    changed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 8. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    moq INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    image VARCHAR(500),
    image2 VARCHAR(500),
    image3 VARCHAR(500),
    description TEXT,
    specifications TEXT,
    status VARCHAR(50) DEFAULT 'active',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. VIDEOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 10. SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_link VARCHAR(500),
    facebook_page VARCHAR(500),
    facebook_group VARCHAR(500),
    office_address TEXT,
    company_name VARCHAR(255) DEFAULT 'H&B Trade',
    company_logo VARCHAR(500),
    about_text TEXT,
    services_text TEXT,
    bkash VARCHAR(100),
    nagad VARCHAR(100),
    bank_account TEXT,
    wechat VARCHAR(100),
    alipay VARCHAR(100),
    wechat_qr TEXT,
    alipay_qr TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DISABLE RLS ON ALL TABLES (for backend API)
-- ============================================
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_tracking_tracking_number ON tracking(tracking_number);
CREATE INDEX IF NOT EXISTS idx_tracking_order_id ON tracking(order_id);
CREATE INDEX IF NOT EXISTS idx_product_requests_status ON product_requests(status);
CREATE INDEX IF NOT EXISTS idx_product_requests_tracking ON product_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_service_requests_tracking_number ON service_requests(tracking_number);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_videos_updated_at ON videos;
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_requests_updated_at ON service_requests;
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DEFAULT DATA
-- ============================================

-- Default Settings
INSERT INTO settings (
    phone, email, whatsapp_link, facebook_page, facebook_group,
    office_address, company_name, about_text, services_text,
    bkash, nagad, bank_account, wechat, alipay
)
VALUES (
    '+880 1234-567890',
    'info@hbtrade.com',
    'https://wa.me/8801234567890',
    'https://www.facebook.com/hbtrade',
    'https://www.facebook.com/groups/hbtrade',
    '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh',
    'H&B Trade',
    'H&B Trade is a leading logistics and sourcing company specializing in China to Bangladesh trade.',
    'Product Sourcing, Wholesale Supply, Sea Shipping, Air Cargo, Hand Carry Services',
    '0183522072',
    '0183522072',
    'Bank: The City Bank
Name: MD ARIFUL ISLAM RONY
Account Number: 2183964509001
Branch: Gulshan-02 Avenue
Routing Number: 225261732
Dhaka, Bangladesh',
    'wechat_hbtrade',
    'alipay_hbtrade'
) ON CONFLICT DO NOTHING;

-- Default Admin User (Password: HbTrade@2024!)
-- Only insert if admin doesn't already exist
INSERT INTO users (name, email, password, role)
SELECT 'Admin', 'admin@hbtrade.com', '$2a$10$SVQlCWDVvsOlC1nDbbah6OpEW2IM/psafOz4871GqSrH8I5Y91w02', 'super_admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@hbtrade.com');

-- Ensure admin is super_admin
UPDATE users SET role = 'super_admin' WHERE email = 'admin@hbtrade.com' AND role = 'admin';

-- ============================================
-- MIGRATION: Add missing columns to existing tables
-- Run these safely - they won't error if columns already exist
-- ============================================

-- Orders: add new columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_info TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_link TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS product_codes VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_info TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_info TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS net_weight VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Product requests: add new columns
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS company VARCHAR(255);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS target_price VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS packaging_type VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS pack_quantity VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS master_pack_quantity VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS pack_dimensions VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS weight_per_pack VARCHAR(100);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS sample_needed VARCHAR(50);
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS specifications TEXT;
ALTER TABLE product_requests ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Products: add new columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image2 VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image3 VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Tracking: add new columns
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS estimated_date DATE;
ALTER TABLE tracking ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Messages: add deleted_at
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Videos: add deleted_at
ALTER TABLE videos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Settings: add new columns
ALTER TABLE settings ADD COLUMN IF NOT EXISTS company_logo VARCHAR(500);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS about_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS services_text TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS bkash VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS nagad VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS wechat VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS alipay VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS wechat_qr TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS alipay_qr TEXT;

-- ============================================
-- SCHEMA COMPLETE!
-- Supports ALL features:
-- - Admin authentication & management (super_admin, admin roles)
-- - Order management with full details & status workflow
-- - Product management with multiple images & categories
-- - Product requests with extended fields & conversion to orders
-- - Service requests (product sourcing, shipping, etc.) with tracking
-- - Order tracking with status history
-- - Contact messages management
-- - Settings with payment QR codes
-- - Video management
-- - Soft delete support on all content tables
-- ============================================
