// 验证 eyeHandlers 端点数
import { eyeHandlers } from './src/services/mockBackend/eyeHandlers';
console.log('eyeHandlers 总数:', eyeHandlers.length);
const byMethod = {};
for (const h of eyeHandlers) {
  const m = h.info?.method || h.method || 'unknown';
  byMethod[m] = (byMethod[m] || 0) + 1;
}
console.log('按方法:', byMethod);
