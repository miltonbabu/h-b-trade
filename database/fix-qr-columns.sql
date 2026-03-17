-- Fix QR code storage for PostgreSQL
-- Base64 images are much larger than VARCHAR(500) can handle
-- Change from VARCHAR(500) to TEXT to allow proper base64 image storage

ALTER TABLE settings 
  ALTER COLUMN wechat_qr TYPE TEXT,
  ALTER COLUMN alipay_qr TYPE TEXT;

-- Add comment to document the change
COMMENT ON COLUMN settings.wechat_qr IS 'Base64 encoded WeChat QR code image';
COMMENT ON COLUMN settings.alipay_qr IS 'Base64 encoded Alipay QR code image';