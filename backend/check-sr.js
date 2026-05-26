const db = require('./config/database');

(async () => {
  await db.initDatabase();
  const result = await db.getMany('SELECT id, service_type, name, details FROM service_requests ORDER BY created_at DESC LIMIT 2');
  console.log('Service Requests Details:');
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
})();
