const bcrypt = require('bcryptjs');

// Script to create initial admin user
// Run this after setting up the database

const createAdminUser = async () => {
  const password = 'admin123'; // Change this in production
  const hashedPassword = await bcrypt.hash(password, 10);
  
  console.log('===========================================');
  console.log('Admin User Creation SQL');
  console.log('===========================================');
  console.log('\nHashed password:', hashedPassword);
  console.log('\nRun this SQL in your PostgreSQL database:\n');
  console.log(`-- Delete existing admin if any
DELETE FROM users WHERE email = 'admin@hbtrade.com';

-- Create admin user
INSERT INTO users (name, email, password, role) 
VALUES (
  'Admin',
  'admin@hbtrade.com',
  '${hashedPassword}',
  'admin'
);`);
  console.log('\n===========================================');
  console.log('Default Credentials:');
  console.log('Email: admin@hbtrade.com');
  console.log('Password: admin123');
  console.log('===========================================');
};

createAdminUser();
