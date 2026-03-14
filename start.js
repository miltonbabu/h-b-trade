const { spawn } = require('child_process');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

console.log(`\n${colors.bright}${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}   H&B Trade Platform - Starting...${colors.reset}`);
console.log(`${colors.bright}${colors.cyan}========================================${colors.reset}\n`);

// Backend server
const backend = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, 'backend'),
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`${colors.blue}[Backend]${colors.reset} ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`${colors.red}[Backend Error]${colors.reset} ${data.toString().trim()}`);
});

backend.on('close', (code) => {
  console.log(`${colors.yellow}[Backend] Process exited with code ${code}${colors.reset}`);
});

// Frontend server
const frontend = spawn('node', ['node_modules/next/dist/bin/next', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true
});

frontend.stdout.on('data', (data) => {
  console.log(`${colors.green}[Frontend]${colors.reset} ${data.toString().trim()}`);
});

frontend.stderr.on('data', (data) => {
  console.error(`${colors.red}[Frontend Error]${colors.reset} ${data.toString().trim()}`);
});

frontend.on('close', (code) => {
  console.log(`${colors.yellow}[Frontend] Process exited with code ${code}${colors.reset}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}Shutting down servers...${colors.reset}`);
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

// Display startup information
setTimeout(() => {
  console.log(`\n${colors.bright}${colors.green}========================================${colors.reset}`);
  console.log(`${colors.bright}${colors.green}   Servers Started Successfully!${colors.reset}`);
  console.log(`${colors.bright}${colors.green}========================================${colors.reset}`);
  console.log(`\n${colors.cyan}Backend:${colors.reset}  http://localhost:5000`);
  console.log(`${colors.cyan}Frontend:${colors.reset} http://localhost:3000`);
  console.log(`\n${colors.yellow}Press Ctrl+C to stop both servers${colors.reset}\n`);
}, 3000);
