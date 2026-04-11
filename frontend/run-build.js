const { spawn } = require('child_process');
const path = require('path');

const frontendDir = __dirname;
const nextBin = path.join(frontendDir, 'node_modules', 'next', 'dist', 'bin', 'next');

const child = spawn('node', [nextBin, 'build'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to build:', err);
  process.exit(1);
});

child.on('close', (code) => {
  process.exit(code || 0);
});