const db = require('../config/database');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const CUSTOMER_ID = '5b8b64af-f6cd-4cc4-8d18-4fccd1091f98';
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  await db.initDatabase();

  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

  const orders = [
    {
      order_number: 'HB2024001', tracking_number: 'TRK2024001001',
      product_name: 'LED Strip Lights 5M RGB', product_codes: 'LED-STRIP-5M',
      quantity: '500', shipping_method: 'Sea Freight', price: 250.00, net_weight: '12.5 kg',
      status: 'delivered',
      items_info: JSON.stringify([{ productName: 'LED Strip Lights 5M RGB', quantity: 5, moq: 100, unitPrice: 0.50, totalUnits: 500, totalPrice: 250 }]),
    },
    {
      order_number: 'HB2024002', tracking_number: 'TRK2024002002',
      product_name: 'Bluetooth Earbuds TWS Pro, USB-C Hub Adapter', product_codes: 'BT-EARBUD-PRO, USB-HUB-7IN1',
      quantity: '350', shipping_method: 'Air Cargo', price: 720.00, net_weight: '8.3 kg',
      status: 'dhaka_office',
      items_info: JSON.stringify([
        { productName: 'Bluetooth Earbuds TWS Pro', quantity: 3, moq: 50, unitPrice: 2.80, totalUnits: 150, totalPrice: 420 },
        { productName: 'USB-C Hub Adapter 7-in-1', quantity: 2, moq: 100, unitPrice: 1.50, totalUnits: 200, totalPrice: 300 }
      ]),
    },
    {
      order_number: 'HB2024003', tracking_number: 'TRK2024003003',
      product_name: 'Smart Watch GT8 Pro', product_codes: 'SW-GT8-PRO',
      quantity: '100', shipping_method: 'Hand Carry', price: 520.00, net_weight: '4.2 kg',
      status: 'in_transit',
      items_info: JSON.stringify([{ productName: 'Smart Watch GT8 Pro', quantity: 2, moq: 50, unitPrice: 5.20, totalUnits: 100, totalPrice: 520 }]),
    },
    {
      order_number: 'HB2024004', tracking_number: 'TRK2024004004',
      product_name: 'Wireless Mouse Ergonomic, Mechanical Keyboard RGB', product_codes: 'WM-ERGO-X1, MK-RGB-87',
      quantity: '2250', shipping_method: 'Sea Freight', price: 2725.00, net_weight: '85.0 kg',
      status: 'guangzhou_warehouse',
      items_info: JSON.stringify([
        { productName: 'Wireless Mouse Ergonomic', quantity: 10, moq: 200, unitPrice: 0.80, totalUnits: 2000, totalPrice: 1600 },
        { productName: 'Mechanical Keyboard RGB 87-Key', quantity: 5, moq: 50, unitPrice: 4.50, totalUnits: 250, totalPrice: 1125 }
      ]),
    },
    {
      order_number: 'HB2024005', tracking_number: 'TRK2024005005',
      product_name: 'Power Bank 20000mAh Fast Charge', product_codes: 'PB-20K-FAST',
      quantity: '500', shipping_method: 'Air Cargo', price: 1600.00, net_weight: '25.0 kg',
      status: 'dhaka_customs',
      items_info: JSON.stringify([{ productName: 'Power Bank 20000mAh Fast Charge', quantity: 5, moq: 100, unitPrice: 3.20, totalUnits: 500, totalPrice: 1600 }]),
    },
    {
      order_number: 'HB2024006', tracking_number: 'TRK2024006006',
      product_name: 'Phone Case iPhone 15 Pro Clear', product_codes: 'PC-IP15-PRO',
      quantity: '10000', shipping_method: 'Sea Freight', price: 1500.00, net_weight: '45.0 kg',
      status: 'processing',
      items_info: JSON.stringify([{ productName: 'Phone Case iPhone 15 Pro Clear', quantity: 20, moq: 500, unitPrice: 0.15, totalUnits: 10000, totalPrice: 1500 }]),
    },
  ];

  const customerInfo = JSON.stringify({ name: 'Milton', email: 'milton@gmail.com', phone: '017344449666', address: 'Dhaka, Bangladesh' });

  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    const id = uuidv4();
    const createdAt = daysAgo(i * 5 + 3);
    try {
      await db.run(
        `INSERT INTO orders (id, order_number, tracking_number, customer_name, customer_info, product_name, product_codes, items_info, quantity, shipping_method, price, net_weight, status, payment_info, notes, customer_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, o.order_number, o.tracking_number, 'Milton', customerInfo, o.product_name, o.product_codes, o.items_info, o.quantity, o.shipping_method, o.price, o.net_weight, o.status, null, '', CUSTOMER_ID, createdAt, createdAt]
      );
      console.log(`✅ Order: ${o.order_number} [${o.status}] → ${o.tracking_number}`);
    } catch (e) {
      console.log(`⚠️ Order ${o.order_number} skipped (${e.message?.substring(0, 50) || 'error'})`);
    }
  }

  const trackingEvents = [
    { tn: 'TRK2024001001', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 30 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Order being prepared', ago: 28 },
      { status: 'guangzhou_warehouse', location: 'Guangzhou Warehouse', note: 'Package received at warehouse', ago: 22 },
      { status: 'in_transit', location: 'South China Sea', note: 'Shipped via Sea Freight', ago: 16 },
      { status: 'dhaka_customs', location: 'Dhaka Customs', note: 'Clearing customs', ago: 5 },
      { status: 'dhaka_office', location: 'Dhaka Office', note: 'Ready for pickup', ago: 2 },
      { status: 'delivered', location: 'Dhaka', note: 'Delivered to customer', ago: 0 },
    ]},
    { tn: 'TRK2024002002', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 18 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Order being prepared', ago: 16 },
      { status: 'guangzhou_warehouse', location: 'Guangzhou Warehouse', note: 'Package received', ago: 12 },
      { status: 'in_transit', location: 'In Flight', note: 'Shipped via Air Cargo', ago: 4 },
      { status: 'dhaka_customs', location: 'Dhaka Customs', note: 'Cleared customs', ago: 2 },
      { status: 'dhaka_office', location: 'Dhaka Office', note: 'Ready for delivery', ago: 1 },
    ]},
    { tn: 'TRK2024003003', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 10 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Order being prepared', ago: 8 },
      { status: 'guangzhou_warehouse', location: 'Guangzhou Warehouse', note: 'Package received', ago: 5 },
      { status: 'in_transit', location: 'In Transit', note: 'Hand carry - en route to Dhaka', ago: 1 },
    ]},
    { tn: 'TRK2024004004', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 12 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Large order being prepared', ago: 9 },
      { status: 'guangzhou_warehouse', location: 'Guangzhou Warehouse', note: 'All items received', ago: 3 },
    ]},
    { tn: 'TRK2024005005', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 14 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Order being prepared', ago: 12 },
      { status: 'guangzhou_warehouse', location: 'Guangzhou Warehouse', note: 'Package received', ago: 8 },
      { status: 'in_transit', location: 'In Flight', note: 'Shipped via Air Cargo', ago: 4 },
      { status: 'dhaka_customs', location: 'Dhaka Customs', note: 'Under customs clearance', ago: 1 },
    ]},
    { tn: 'TRK2024006006', events: [
      { status: 'pending', location: 'Online', note: 'Order received', ago: 6 },
      { status: 'processing', location: 'Guangzhou Office', note: 'Bulk order being processed', ago: 3 },
    ]},
  ];

  for (const track of trackingEvents) {
    for (const ev of track.events) {
      try {
        await db.run(
          `INSERT INTO tracking (id, tracking_number, status, location, note, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
          [uuidv4(), track.tn, ev.status, ev.location, ev.note, daysAgo(ev.ago)]
        );
      } catch (e) { }
    }
    console.log(`✅ Tracking: ${track.tn} (${track.events.length} events)`);
  }

  const productRequests = [
    {
      product_name: 'Portable Bluetooth Speaker JBL Style', product_link: 'https://example.com/jbl-speaker',
      target_price: '$3.50/unit', quantity: '500 pcs', packaging_type: 'Retail Box',
      pack_quantity: '20', master_pack_quantity: '200', pack_dimensions: '15x10x8 cm',
      weight_per_pack: '0.8 kg', sample_needed: 'yes', shipping_method: 'Sea Freight',
      specifications: 'IPX7 waterproof, 12hr battery, TWS pairing',
      message: 'Need custom logo printing on speaker grill. Quote for 500 and 1000 pcs.',
      tracking_number: 'PR2024001001', status: 'processing',
    },
    {
      product_name: 'Stainless Steel Vacuum Flask 500ml', product_link: 'https://example.com/flask-500',
      target_price: '$2.00/unit', quantity: '1000 pcs', packaging_type: 'Gift Box',
      pack_quantity: '10', master_pack_quantity: '100', pack_dimensions: '25x8x8 cm',
      weight_per_pack: '0.5 kg', sample_needed: 'yes', shipping_method: 'Air Cargo',
      specifications: 'Double wall vacuum, 24hr hot/12hr cold, BPA free',
      message: 'Need custom color options: black, white, navy blue.',
      tracking_number: 'PR2024002002', status: 'completed',
    },
    {
      product_name: 'Kids Educational Tablet 7-inch', product_link: 'https://example.com/kid-tablet',
      target_price: '$15.00/unit', quantity: '200 pcs', packaging_type: 'Color Box',
      pack_quantity: '5', master_pack_quantity: '50', pack_dimensions: '30x20x10 cm',
      weight_per_pack: '0.6 kg', sample_needed: 'yes', shipping_method: 'Sea Freight',
      specifications: 'Android 12, 2GB RAM, 32GB, pre-loaded educational apps',
      message: 'Need Bengali language pre-installed and custom startup screen.',
      tracking_number: 'PR2024003003', status: 'pending',
    },
  ];

  for (const r of productRequests) {
    try {
      await db.run(
        `INSERT INTO product_requests (id, name, phone, whatsapp, email, company, product_name, product_link, target_price, quantity, packaging_type, pack_quantity, master_pack_quantity, pack_dimensions, weight_per_pack, sample_needed, shipping_method, specifications, message, tracking_number, status, customer_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), 'Milton', '017344449666', '017344449666', 'milton@gmail.com', 'Milton Trading Co.', r.product_name, r.product_link, r.target_price, r.quantity, r.packaging_type, r.pack_quantity, r.master_pack_quantity, r.pack_dimensions, r.weight_per_pack, r.sample_needed, r.shipping_method, r.specifications, r.message, r.tracking_number, r.status, CUSTOMER_ID]
      );
      console.log(`✅ Product Request: ${r.product_name} [${r.status}]`);
    } catch (e) {
      console.log(`⚠️ Product request skipped (${e.message?.substring(0, 50) || 'error'})`);
    }
  }

  const serviceRequests = [
    {
      service_type: 'product_sourcing', details: JSON.stringify({ productCategory: 'Electronics', sourceCountry: 'China', targetPrice: '$5-10/unit', quantity: '1000' }),
      message: 'Need help sourcing affordable wireless charging pads from Shenzhen. QC inspection needed before shipping.',
      tracking_number: 'PS2024001001', status: 'in_progress', admin_notes: 'Contacting 3 suppliers in Shenzhen. Best quote: $4.20/unit.', price: null,
    },
    {
      service_type: 'sea_shipping', details: JSON.stringify({ cargoType: 'General Merchandise', weight: '500 kg', volume: '2 CBM', origin: 'Guangzhou', destination: 'Dhaka' }),
      message: 'Sea freight quote for 500kg mixed electronics from Guangzhou to Dhaka.',
      tracking_number: 'SS2024002002', status: 'completed', admin_notes: 'Booked on COSCO vessel. ETA Dhaka: May 28.', price: 350.00,
    },
    {
      service_type: 'air_cargo', details: JSON.stringify({ cargoType: 'Electronics', weight: '50 kg', urgent: 'Yes', origin: 'Guangzhou', destination: 'Dhaka' }),
      message: 'Urgent air cargo for 50kg smartphone accessories. Delivery within 5 days.',
      tracking_number: 'AC2024003003', status: 'received', admin_notes: null, price: null,
    },
    {
      service_type: 'canton_fair', details: JSON.stringify({ fairSession: 'Phase 2 (Oct 23-27)', interests: 'Consumer Electronics, Lighting', hotelNeeded: 'Yes', translatorNeeded: 'Yes' }),
      message: 'Attending Canton Fair Phase 2. Need hotel booking, factory visits, and translator.',
      tracking_number: 'CF2024004004', status: 'in_progress', admin_notes: 'Hotel booked at Guangzhou Baiyun Hotel. Translator confirmed.', price: 200.00,
    },
    {
      service_type: 'hand_carry', details: JSON.stringify({ cargoType: 'Samples', weight: '5 kg', itemsCount: '3 boxes', origin: 'Guangzhou', destination: 'Dhaka' }),
      message: 'Hand carry service for 5kg product samples. Need within 3 days.',
      tracking_number: 'HC2024005005', status: 'completed', admin_notes: 'Delivered on May 20 via hand carry.', price: 80.00,
    },
  ];

  for (const r of serviceRequests) {
    try {
      await db.run(
        `INSERT INTO service_requests (id, service_type, name, phone, whatsapp, email, company, details, message, tracking_number, status, admin_notes, price, customer_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [uuidv4(), r.service_type, 'Milton', '017344449666', '017344449666', 'milton@gmail.com', 'Milton Trading Co.', r.details, r.message, r.tracking_number, r.status, r.admin_notes, r.price, CUSTOMER_ID]
      );
      console.log(`✅ Service Request: ${r.service_type} [${r.status}]`);
    } catch (e) {
      console.log(`⚠️ Service request skipped (${e.message?.substring(0, 50) || 'error'})`);
    }
  }

  console.log('\n🎉 Demo data seeded successfully!');
  process.exit(0);
};

seed().catch(e => { console.error('Seed error:', e); process.exit(1); });
