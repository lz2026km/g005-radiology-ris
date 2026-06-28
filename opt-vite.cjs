const fs = require('fs');
const v = 'E:/opencode work/FS/G005-RISv-3.0.0/vite.config.ts';
let c = fs.readFileSync(v, 'utf8');

// Find build: { and add manualChunks before it
const buildIdx = c.indexOf('build: {');
if (buildIdx >= 0) {
  const buildEnd = c.indexOf(',\n  }', buildIdx + 5);
  const existingBuild = c.slice(buildIdx, buildEnd + 5);
  if (!existingBuild.includes('manualChunks')) {
    const newBuild = `build: {
    target: 'es2020',
    minify: 'esbuild',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'charts-vendor': ['recharts', 'echarts'],
          'db-vendor': ['dexie'],
          'xstate-vendor': ['xstate'],
        },
      },
    },
  }`;
    c = c.slice(0, buildIdx) + newBuild + c.slice(buildEnd + 5);
    fs.writeFileSync(v, c, 'utf8');
    console.log('Updated vite.config.ts with manual chunks');
  } else {
    console.log('Already has manualChunks');
  }
}
