const db = require('./config/database');

const DEMO_PRODUCTS = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    product_code: 'HB-WS-001',
    name: 'Premium Cotton T-Shirts (Pack of 50)',
    category: 'Apparel',
    price: 12500,
    moq: 50,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20cotton%20t-shirts%20pack%20on%20pallet%20warehouse%20professional%20product%20photo&image_size=landscape_16_9',
    description: 'High-quality premium cotton t-shirts in bulk. Perfect for branding and resale. Available in multiple colors.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    product_code: 'HB-WS-002',
    name: 'Eco-Friendly Paper Bags (1000pcs)',
    category: 'Packaging',
    price: 8500,
    moq: 1000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20eco%20friendly%20paper%20bags%20brown%20kraft%20packaging%20product%20photo&image_size=landscape_16_9',
    description: 'Environmentally friendly brown kraft paper bags. Ideal for retail and food packaging.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    product_code: 'HB-WS-003',
    name: 'USB Flash Drives 16GB (50pcs)',
    category: 'Electronics',
    price: 15000,
    moq: 50,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20usb%20flash%20drives%20bulk%20pack%20electronic%20gadgets%20product%20photo&image_size=landscape_16_9',
    description: 'High-speed USB 3.0 flash drives. Perfect for promotional giveaways or resale.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    product_code: 'HB-WS-004',
    name: 'Stainless Steel Water Bottles (24pcs)',
    category: 'Household',
    price: 18000,
    moq: 24,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20stainless%20steel%20water%20bottles%20pack%20modern%20design%20product%20photo&image_size=landscape_16_9',
    description: 'Double-walled insulated stainless steel bottles. Keeps drinks hot/cold for 12+ hours.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    product_code: 'HB-WS-005',
    name: 'Printed Notebooks (100pcs)',
    category: 'Stationery',
    price: 6500,
    moq: 100,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20printed%20notebooks%20stationery%20office%20supplies%20product%20photo&image_size=landscape_16_9',
    description: 'Premium quality notebooks with lined pages. Custom branding available.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440006',
    product_code: 'HB-WS-006',
    name: 'LED Desk Lamps (20pcs)',
    category: 'Electronics',
    price: 22000,
    moq: 20,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20LED%20desk%20lamps%20modern%20design%20office%20lighting%20product%20photo&image_size=landscape_16_9',
    description: 'Energy-efficient LED desk lamps with adjustable brightness. Perfect for offices and homes.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440007',
    product_code: 'HB-WS-007',
    name: 'Canvas Tote Bags (200pcs)',
    category: 'Packaging',
    price: 12000,
    moq: 200,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20canvas%20tote%20bags%20reusable%20shopping%20bags%20product%20photo&image_size=landscape_16_9',
    description: 'Durable cotton canvas tote bags. Great for retail stores and promotional events.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440008',
    product_code: 'HB-WS-008',
    name: 'Bamboo Toothbrushes (500pcs)',
    category: 'Household',
    price: 4500,
    moq: 500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20bamboo%20toothbrushes%20eco%20friendly%20bathroom%20product%20photo&image_size=landscape_16_9',
    description: '100% biodegradable bamboo toothbrushes with soft bristles. Eco-friendly alternative.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440009',
    product_code: 'HB-WS-009',
    name: 'Educational Building Blocks (200pcs)',
    category: 'Toys & Games',
    price: 9500,
    moq: 50,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20educational%20building%20blocks%20toys%20bulk%20product%20photo&image_size=landscape_16_9',
    description: 'Colorful educational building blocks for children. Enhances creativity and motor skills. Non-toxic materials.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
    product_code: 'HB-WS-010',
    name: 'Natural Lip Balms (100pcs)',
    category: 'Beauty & Personal Care',
    price: 5500,
    moq: 100,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20natural%20lip%20balms%20beauty%20products%20bulk%20product%20photo&image_size=landscape_16_9',
    description: 'Organic lip balms with natural ingredients. Moisturizing and nourishing formula. Available in various flavors.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440011',
    product_code: 'HB-WS-011',
    name: 'Yoga Mats (50pcs)',
    category: 'Sports & Outdoors',
    price: 18000,
    moq: 50,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20yoga%20mats%20exercise%20fitness%20bulk%20product%20photo&image_size=landscape_16_9',
    description: 'Premium non-slip yoga mats. 6mm thickness for comfort. Perfect for yoga, pilates, and floor exercises.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
    product_code: 'HB-WS-012',
    name: 'Organic Green Tea (500 boxes)',
    category: 'Food & Beverages',
    price: 22000,
    moq: 500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20organic%20green%20tea%20boxes%20beverages%20bulk%20product%20photo&image_size=landscape_16_9',
    description: 'Premium organic green tea bags. Rich in antioxidants. 25 bags per box. Authentic Chinese tea.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440013',
    product_code: 'HB-WS-013',
    name: 'LED String Lights (100pcs)',
    category: 'Home & Garden',
    price: 7800,
    moq: 100,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20LED%20string%20lights%20home%20decor%20garden%20product%20photo&image_size=landscape_16_9',
    description: 'Energy-efficient LED string lights. Waterproof for indoor/outdoor use. Perfect for decoration and events.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
    product_code: 'HB-WS-014',
    name: 'Car Phone Mounts (200pcs)',
    category: 'Automotive',
    price: 6500,
    moq: 200,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20car%20phone%20mounts%20automotive%20accessories%20product%20photo&image_size=landscape_16_9',
    description: 'Universal magnetic car phone mounts. Strong hold, easy installation. Compatible with all smartphone sizes.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    product_code: 'HB-WS-015',
    name: 'Pet Collars & Leashes Set (300pcs)',
    category: 'Pet Supplies',
    price: 11000,
    moq: 300,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20pet%20collars%20leashes%20dog%20cat%20supplies%20product%20photo&image_size=landscape_16_9',
    description: 'Durable nylon pet collars and leashes. Adjustable sizes. Available in multiple colors.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    product_code: 'HB-WS-016',
    name: 'Ballpoint Pens (1000pcs)',
    category: 'Office Supplies',
    price: 4800,
    moq: 1000,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20ballpoint%20pens%20office%20supplies%20bulk%20product%20photo&image_size=landscape_16_9',
    description: 'Smooth-writing ballpoint pens. Blue/black ink options. Perfect for offices, schools, and businesses.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    product_code: 'HB-WS-017',
    name: 'Safety Helmets (100pcs)',
    category: 'Industrial & Safety',
    price: 25000,
    moq: 100,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20safety%20helmets%20hard%20hats%20industrial%20product%20photo&image_size=landscape_16_9',
    description: 'OSHA-compliant safety helmets. Impact-resistant. Adjustable suspension system. Multiple colors available.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    product_code: 'HB-WS-018',
    name: 'First Aid Kits (200pcs)',
    category: 'Health & Safety',
    price: 15000,
    moq: 200,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20first%20aid%20kits%20emergency%20supplies%20product%20photo&image_size=landscape_16_9',
    description: 'Comprehensive first aid kits with essential supplies. Perfect for offices, homes, and travel.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    product_code: 'HB-WS-019',
    name: 'Wireless Earbuds (100pcs)',
    category: 'Electronics',
    price: 35000,
    moq: 100,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20wireless%20earbuds%20bluetooth%20electronics%20product%20photo&image_size=landscape_16_9',
    description: 'True wireless earbuds with charging case. Noise cancellation. Long battery life. Premium sound quality.',
    status: 'active'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    product_code: 'HB-WS-020',
    name: 'Cotton Face Masks (500pcs)',
    category: 'Beauty & Personal Care',
    price: 8500,
    moq: 500,
    image: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=wholesale%20cotton%20face%20masks%20reusable%20beauty%20product%20photo&image_size=landscape_16_9',
    description: 'Reusable cotton face masks. Comfortable fit, breathable fabric. Washable and eco-friendly.',
    status: 'active'
  }
];

async function addDemoProducts() {
  try {
    await db.initDatabase();
    
    console.log('=== Adding Demo Products ===\n');
    
    for (const product of DEMO_PRODUCTS) {
      const exists = await db.getOne('SELECT id FROM products WHERE id = ?', [product.id]);
      
      if (exists) {
        console.log(`✓ Product ${product.product_code} already exists, skipping...`);
        continue;
      }
      
      await db.run(
        `INSERT INTO products (id, product_code, name, category, price, moq, image, description, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          product.id,
          product.product_code,
          product.name,
          product.category,
          product.price,
          product.moq,
          product.image,
          product.description,
          product.status
        ]
      );
      
      console.log(`✓ Added: ${product.name}`);
    }
    
    const count = await db.getOne('SELECT COUNT(*) as count FROM products WHERE status = "active"');
    console.log(`\n=== Done! ${count.count} active products in database ===`);
    
  } catch (error) {
    console.error('Error adding demo products:', error);
  }
  process.exit(0);
}

addDemoProducts();
