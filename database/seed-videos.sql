-- ============================================
-- H&B Trade - Sample Videos (4 Example Videos)
-- Run this in Supabase SQL Editor
-- ============================================

-- Insert 4 example videos for the website
INSERT INTO videos (id, title, youtube_url, description, status) VALUES
(
  gen_random_uuid(),
  'Complete Guide: China to Bangladesh Import Business',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Learn everything about importing products from China to Bangladesh. We cover customs clearance, documentation, payment methods, and logistics tips for successful trade.',
  'active'
),
(
  gen_random_uuid(),
  'How We Source Products from Guangzhou Market',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Join us on a virtual tour of Guangzhou wholesale markets! See how we find suppliers, negotiate prices, and ensure quality control for your orders.',
  'active'
),
(
  gen_random_uuid(),
  'Canton Fair 2026 - What You Need to Know',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Essential tips for visiting Canton Fair in Guangzhou. Learn about registration, finding suppliers, negotiating deals, and making the most of your visit.',
  'active'
),
(
  gen_random_uuid(),
  'H&B Trade - Your China-Bangladesh Trade Partner',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'Discover how H&B Trade helps businesses source products from China and deliver them to Bangladesh. Air cargo, sea shipping, hand carry services explained.',
  'active'
);

-- Verify insertion
SELECT id, title, status, created_at FROM videos ORDER BY created_at DESC;
