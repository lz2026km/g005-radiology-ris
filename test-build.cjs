const { execSync } = require('child_process');
try {
  const out = execSync('npm run build 2>&1', { cwd: 'E:/opencode work/FS/G005-RISv-3.0.0', encoding: 'utf8', timeout: 300000 });
  console.log('BUILD SUCCESS');
} catch (e) {
  const msg = e.stdout || e.message;
  // Extract error lines
  const lines = msg.split('\n');
  console.log('Last 30 lines:');
  for (let i = Math.max(0, lines.length - 30); i < lines.length; i++) {
    console.log(lines[i]);
  }
}
