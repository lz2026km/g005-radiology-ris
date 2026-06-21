import { spawn } from 'child_process';
import { setTimeout as wait } from 'timers/promises';

console.log('=== 启动 Vite preview server ===');
const server = spawn('node', ['node_modules/vite/bin/vite.js', 'preview', '--port', '5199', '--host', '127.0.0.1'], {
  cwd: 'E:\\opencode work\\FS\\G005-RISv-3.0.0',
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

server.stdout.on('data', (d) => console.log('[stdout]', d.toString().trim()));
server.stderr.on('data', (d) => console.log('[stderr]', d.toString().trim()));

// 等待服务启动
await wait(20000);
console.log('=== Server should be up. Testing with curl ===');

import { execSync } from 'child_process';
try {
  const r = execSync('curl -sI http://127.0.0.1:5199/', { encoding: 'utf-8' });
  console.log(r.split('\n').slice(0, 3).join('\n'));
} catch (e) {
  console.log('curl failed:', e.message);
}

console.log('Server PID:', server.pid);
console.log('Leaving server running...');
