-- ============================================
-- MIGRATION: Email Notifications (Resend)
-- Run this on an existing Supabase/PostgreSQL database.
-- (Fresh installs get these automatically from supabase-schema.sql
--  or from the backend auto-init in backend/config/database.js.)
-- ============================================

-- Settings: email notification configuration
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email_from_name VARCHAR(100);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS admin_notification_email VARCHAR(255);
ALTER TABLE settings ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_customer_status_updates BOOLEAN DEFAULT true;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS notify_admin_new_activity BOOLEAN DEFAULT true;

-- Email delivery log (every customer/admin email is recorded here)
CREATE TABLE IF NOT EXISTS email_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    to_email VARCHAR(255) NOT NULL,
    from_email VARCHAR(255),
    reply_to VARCHAR(255),
    subject VARCHAR(500),
    category VARCHAR(50),          -- welcome, order_confirmation, order_status_update, tracking_update, admin_alert, ...
    recipient_type VARCHAR(20),    -- 'customer' | 'admin'
    related_type VARCHAR(50),      -- order | service_request | product_request | message | customer | event_registration | invoice
    related_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'queued',  -- queued | sent | failed | skipped
    error TEXT,
    resend_id VARCHAR(100),        -- Resend message id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_log_category ON email_log(category);
CREATE INDEX IF NOT EXISTS idx_email_log_created_at ON email_log(created_at);

-- Optional: seed admin notification email (replace with your real admin inbox)
-- UPDATE settings SET admin_notification_email = 'admin@hbtrade.ltd' WHERE admin_notification_email IS NULL;
