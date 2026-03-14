const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { spawn } = require('child_process');

const backendDir = __dirname;
const serverFile = path.join(backendDir, 'server.js');

const child = spawn('node', [serverFile], {
  cwd: backendDir,
  stdio: 'inherit',
  shell: false,
  env: { ...process.env }
});

child.on('error', (err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});
