const db = require('./config/database');

(async () => {
  await db.initDatabase();
  
  console.log('=== Final Wholesale Order Verification ===\n');
  
  // Get the latest wholesale order
  const orders = await db.getMany(
    'SELECT * FROM orders ORDER BY created_at DESC LIMIT 2'
  );
  
  console.log('Recent Orders:');
  orders.forEach((order, i) => {
    console.log(`\n[${i + 1}] Order #${order.order_number}`);
    console.log('    Customer:', order.customer_name);
    console.log('    Product Name:', order.product_name);
    console.log('    Quantity:', order.quantity);
    console.log('    Price:', order.price);
    console.log('    Status:', order.status);
    
    if (order.items_info) {
      try {
        const items = JSON.parse(order.items_info);
        console.log('    Items Info:');
        console.log('      - Product Category:', items.product_category || '(none)');
        console.log('      - Product Names:', items.product_names || '(none)');
        console.log('      - Quantity:', items.quantity || '(none)');
        console.log('      - Budget Range:', items.budget_range || '(none)');
        console.log('      - Service Type:', items._service_type || '(none)');
      } catch (e) {
        console.log('    (Could not parse items_info)');
      }
    }
  });
  
  // Check if wholesale orders have correct data
  const latestOrder = orders[0];
  console.log('\n\n=== VERIFICATION RESULTS ===');
  console.log('Latest Order:', latestOrder.order_number);
  
  const isWholesaleOrder = latestOrder.customer_name.includes('Wholesale');
  console.log('Is Wholesale Order:', isWholesaleOrder ? 'YES ✓' : 'NO');
  
  const hasCorrectProductName = latestOrder.product_name === 'Smartphones, Tablets, Laptops';
  console.log('Has Correct Product Name:', hasCorrectProductName ? 'YES ✓' : 'NO');
  
  const hasCorrectQuantity = latestOrder.quantity === '1000 units';
  console.log('Has Correct Quantity:', hasCorrectQuantity ? 'YES ✓' : 'NO');
  
  const hasItemsInfo = latestOrder.items_info && latestOrder.items_info.length > 0;
  console.log('Has Items Info:', hasItemsInfo ? 'YES ✓' : 'NO');
  
  if (hasItemsInfo) {
    try {
      const items = JSON.parse(latestOrder.items_info);
      const hasProductCategory = !!items.product_category;
      const hasProductNames = !!items.product_names;
      const hasBudgetRange = !!items.budget_range;
      
      console.log('  - Contains product_category:', hasProductCategory ? 'YES ✓' : 'NO');
      console.log('  - Contains product_names:', hasProductNames ? 'YES ✓' : 'NO');
      console.log('  - Contains budget_range:', hasBudgetRange ? 'YES ✓' : 'NO');
    } catch (e) {
      console.log('  (Could not parse items_info)');
    }
  }
  
  console.log('\n========================');
  
  process.exit(0);
})();
