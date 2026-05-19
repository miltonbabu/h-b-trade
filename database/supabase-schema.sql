-- H&B Trade Schema for Supabase (FIXED ORDER)
-- WITHOUT RLS - For backend API use
-- Copy ALL of this and paste into Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (first, no dependencies)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORDERS TABLE (before product_requests, because product_requests references it)
CREATE TABLE orders (
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCT REQUESTS TABLE (references orders - now orders exists!)
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

-- 4. TRACKING TABLE (references orders)
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

-- 5. STATUS HISTORY TABLE
CREATE TABLE status_history (
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

-- 6. MESSAGES TABLE
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. PRODUCTS TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_code VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    moq INTEGER DEFAULT 1,
    image VARCHAR(500),
    image2 VARCHAR(500),
    image3 VARCHAR(500),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. VIDEOS TABLE
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    youtube_url TEXT NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SETTINGS TABLE
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(50),
    email VARCHAR(255),
    whatsapp_link VARCHAR(500),
    facebook_page VARCHAR(500),
    facebook_group VARCHAR(500),
    office_address TEXT,
    company_name VARCHAR(255) DEFAULT 'H&B Trade',
    bkash VARCHAR(100),
    nagad VARCHAR(100),
    bank_account TEXT,
    wechat VARCHAR(100),
    alipay VARCHAR(100),
    wechat_qr TEXT,
    alipay_qr TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DISABLE RLS ON ALL TABLES (for backend API)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE product_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE status_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;

-- INDEXES FOR PERFORMANCE
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_customer_name ON orders(customer_name);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_tracking_tracking_number ON tracking(tracking_number);
CREATE INDEX idx_product_requests_status ON product_requests(status);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);

-- TRIGGERS FOR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- DEFAULT DATA

INSERT INTO settings (phone, email, whatsapp_link, facebook_page, facebook_group, office_address, company_name, bkash, nagad, bank_account, wechat, alipay)
VALUES ('+880 1234-567890', 'info@hbtrade.com', 'https://wa.me/8801234567890', 'https://www.facebook.com/hbtrade', 'https://www.facebook.com/groups/hbtrade', '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh', 'H&B Trade', '0183522072', '0183522072', 'Bank: The City Bank\nName: MD ARIFUL ISLAM RONY\nAccount Number: 2183964509001\nBranch: Gulshan-02 Avenue\nRouting Number: 225261732\nDhaka, Bangladesh', 'wechat_hbtrade', 'alipay_hbtrade');

INSERT INTO users (name, email, password, role) 
VALUES ('Admin', 'admin@hbtrade.com', '$2a$10$SVQlCWDVvsOlC1nDbbah6OpEW2IM/psafOz4871GqSrH8I5Y91w02', 'super_admin');

-- SCHEMA COMPLETE!
