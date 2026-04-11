-- H&B Trade Database Schema (COMPLETE VERSION)
-- PostgreSQL Database - Updated with all fields for admin panel
-- This is the COMPLETE schema with all fields

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (Admin Authentication)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PRODUCT REQUESTS TABLE
-- ============================================
CREATE TABLE product_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255) NOT NULL,
    product_name VARCHAR(500) NOT NULL,
    product_link TEXT,
    quantity VARCHAR(100),
    shipping_method VARCHAR(100),
    message TEXT,
    image VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending',
    tracking_number VARCHAR(100),
    converted_to_order UUID REFERENCES orders(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    tracking_number VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_info TEXT,
    product_name VARCHAR(500) NOT NULL,
    product_link TEXT,
    quantity VARCHAR(100),
    shipping_method VARCHAR(100),
    price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    estimated_delivery DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. TRACKING TABLE
-- ============================================
CREATE TABLE tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_number VARCHAR(100) NOT NULL,
    order_id UUID REFERENCES orders(id),
    status VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    carrier VARCHAR(100),
    note TEXT,
    estimated_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. MESSAGES TABLE (Contact Form)
-- ============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. PRODUCTS TABLE (Wholesale Products)
-- ============================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(50) UNIQUE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. VIDEOS TABLE (YouTube Videos)
-- ============================================
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_videos_status ON videos(status);

CREATE TRIGGER update_videos_updated_at 
    BEFORE UPDATE ON videos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. SETTINGS TABLE (Site Configuration)
-- ============================================
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) DEFAULT 'H&B Trade',
    company_logo VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_link VARCHAR(500),
    facebook_page VARCHAR(500),
    facebook_group VARCHAR(500),
    wechat_qr VARCHAR(500),
    alipay_qr VARCHAR(500),
    office_address TEXT,
    about_text TEXT,
    services_text TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tracking_tracking_number ON tracking(tracking_number);
CREATE INDEX idx_tracking_order_id ON tracking(order_id);
CREATE INDEX idx_product_requests_status ON product_requests(status);
CREATE INDEX idx_product_requests_tracking ON product_requests(tracking_number);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_product_code ON products(product_code);

-- ============================================
-- 10. CREATE TRIGGERS FOR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at 
    BEFORE UPDATE ON settings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. INSERT DEFAULT DATA
-- ============================================

-- Default Settings
INSERT INTO settings (
    company_name, phone, email, whatsapp_link, facebook_page, facebook_group, 
    office_address, about_text, services_text
)
VALUES (
    'H&B Trade',
    '+880 1234-567890',
    'info@hbtrade.com',
    'https://wa.me/8801234567890',
    'https://www.facebook.com/hbtrade',
    'https://www.facebook.com/groups/hbtrade',
    '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh',
    'H&B Trade is a leading logistics and sourcing company specializing in China to Bangladesh trade.',
    'Product Sourcing, Wholesale Supply, Sea Shipping, Air Cargo, Hand Carry Services'
);

-- Default Admin User
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (name, email, password, role) 
VALUES (
    'Admin',
    'admin@hbtrade.com',
    '$2a$10$SVQlCWDVvsOlC1nDbbah6OpEW2IM/psafOz4871GqSrH8I5Y91w02',
    'admin'
);

-- ============================================
-- SCHEMA COMPLETE
-- ============================================
-- This schema supports ALL features:
-- ✓ Admin authentication & management
-- ✓ Order management with full details
-- ✓ Product management with multiple images
-- ✓ Product requests with conversion to orders
-- ✓ Tracking with order references
-- ✓ Contact messages management
-- ✓ Settings with QR codes
-- ✓ Analytics and reporting
-- ✓ Video management
