// 添加 /notifications/prefs 端点
const fs = require('fs');
const f = 'E:/opencode work/FS/G005-RISv-3.0.0/src/services/mockBackend/handlers.ts';
let c = fs.readFileSync(f, 'utf8');
const prefix = '  // 通知发送 (push/email/sms)\n  http.post(`${API_BASE}/notifications/send`';
const replacement = `  // 通知偏好 (v3.0.6.8-47)
  http.get(\`\${API_BASE}/notifications/prefs\`, async () => {
    await delay(30);
    return HttpResponse.json({
      success: true,
      data: { userId: 'A001', email: true, sms: true, inApp: true, dingtalk: false, wechat: false, pushHour: '08:00' },
    });
  }),

  // 通知发送 (push/email/sms)
  http.post(\`\${API_BASE}/notifications/send\``;
if (c.includes(prefix)) {
  c = c.replace(prefix, replacement);
  fs.writeFileSync(f, c, 'utf8');
  console.log('Added /notifications/prefs endpoint');
} else {
  console.log('Pattern not found');
}
