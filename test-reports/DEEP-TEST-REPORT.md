# G005 RIS 深度动态测试报告

## 测试概况

- **目标**: http://127.0.0.1:5199/g005-radiology-ris
- **测试方法**: Playwright headless Chrome 1440x900, 直接 page.goto + localStorage 注入
- **注入身份**: 管理员 (id=A001, role=管理员, department=信息科)
- **总页面数**: 128
- **总耗时**: ~23 分钟
- **截图保存**: E:\opencode work\FS\G005-RISv-3.0.0\test-screenshots\deep\ (128 张)
- **详细报告**: E:\opencode work\FS\G005-RISv-3.0.0\test-reports\deep-test-report.json

## 测试结果汇总

| 状态 | 数量 | 占比 | 含义 |
|------|------|------|------|
| OK | 40 | 31.2% | 完全正常 |
| OK_DEAD_BTN | 46 | 35.9% | 渲染正常, 但有 1 个死按钮 |
| DEAD_BTN | 42 | 32.8% | 渲染正常, 但有 ≥2 个死按钮 |
| BLANK | 0 | 0% | 无空白页 |
| 404 | 0 | 0% | 无 404 跳转 |
| 500 | 0 | 0% | 无 500 跳转 |
| CRASH | 0 | 0% | 无崩溃 |

通过率 (OK + OK_DEAD_BTN): 86 / 128 = 67.2%

## 1. 渲染错误 (严重 BUG)

### 1.1 /insurance-audit 医保审核 — 完全崩溃
- **症状**: 整个页面被 ErrorBoundary 接管, 显示 "抱歉,出现了一些问题"
- **原因**: `ReferenceError: t is not defined` (200 条重复错误)
- **位置**: InsuranceAuditPage-38inYmv9.js:1:49642
- **截图**: test-screenshots\deep\058-医保审核.png (可见 ErrorBoundary 错误页)
- **影响**: 该页面所有功能完全不可用, 4 个 tab 全挂

### 1.2 /equipment-efficiency 设备效率 — SVG 渲染异常
- **症状**: `<g> attribute transform: Expected transform function, "translate(0, 0)}"` 等 4 条
- **原因**: Recharts 组件传入非法 transform 字符串 (含尾随 `}`)
- **位置**: recharts 库, 由 EquipmentEfficiency 触发
- **影响**: 图表视觉错位, 鼠标交互异常

### 1.3 /dictionary 数据字典 — React Hook 错误
- **症状**: `Minified React error #310` (Rendered fewer hooks than expected)
- **原因**: 条件分支内调用 React Hook, 违反 Rules of Hooks
- **影响**: 该组件树崩溃, 刷新后大概率再次触发

## 2. Console 错误 (11 条, 4 类)

```
[1] ReferenceError: t is not defined
    触发页面: /insurance-audit (×200)
    位置: InsuranceAuditPage 打包文件
    状态: 严重 (页面崩溃)

[2] [API] Network error GET /api/v1/search?q=
    触发页面: /enterprise-search
    错误: SyntaxError: Unexpected end of JSON input
    HTTP: 500 Internal Server Error (mock 后端未实现)
    状态: 中 (后端 mock 缺失)

[3] Minified React error #310
    触发页面: /dictionary
    含义: "Rendered fewer hooks than expected"
    状态: 严重 (条件分支内调用 hook)

[4] <g> attribute transform: Expected transform function
    触发页面: /equipment-efficiency (×4)
    状态: 中 (图表渲染异常, 不致命)
```

## 3. 失败请求 (4 个)

```
[2x] HTTP 404: /mock-images/ct-001.png   ← 静态 mock 图片缺失
[2x] HTTP 404: /mock-images/ct-002.png
[1x] HTTP 404: /mock-images/mr-001.png
[1x] HTTP 500: /api/v1/search?q=         ← 后端 mock 未实现
```

## 4. 死按钮 (155 个, 跨 88 个页面)

### 4.1 严重死按钮 (DEAD_BTN 页面, 42 个)

[3] /worklist 工作台
   - "收起", "列表"
[6] /follow-up 随访
   - "收起", "搜索", "+ 新增随访", "全部 (100)"
[11] /reports/v3-write 报告书写 V3
   - "收起", "保存"
[26] /report-score-rule 评分规则
   - "恢复默认", "保存配置", "添加新维度"
[27] /report-defect-library 缺陷库
   - "新增缺陷", "编辑", "触发记录"
[28] /special-assessment 特殊评估
   - "A - 脂肪型", "B - 散在纤维腺体型"
[31] /cds/management CDS 管理
   - "新建规则", "适宜性规则"
[32] /cds/statistics CDS 统计
   - "近7天", "近30天", "近90天"
[34] /ai-structured-report AI 结构化报告
   - "收起", "语音录入", "CT专科"
[40] /dose-track 剂量追踪
   - "doseTrack.exportPatient", "doseTrack.exportDevice", "doseTrack.tabs.overview" (i18n key 未翻译, 直接显示给用户)
[42] /patient-portal 患者门户
   - "收起", "查询影像"
[48] /schedule 排班
   - "节假日配置", "导出排班"
[49] /appointment-management 预约管理
   - "列表", "新建预约"
[50] /queue-call 排队叫号
   - "收起", "刷新", "语音", "重呼"
[52] /routing-rules 路由规则
   - "收起", "模拟执行", "保存"
[57] /data-report-center 数据上报中心
   - "2026-05", "检查量统计"
[60] /typical-cases 典型病例
   - "收起", "batchImport", "exportCases" (i18n key 未翻译)
[61] /finding-library 征象库
   - "收起", "全部473", "头部30"
[68] /report-phrase-bank 报告短语库
   - "新建短语", "复制", "编辑"
[73] /operation-log 操作日志
   - "收起", "导出CSV", "隐藏统计", "列表视图"
[74] /notification-center 通知中心
   - "收起", "全部200"
[78] /finance/department 科室财务
   - "月度", "季度", "年度"
[80] /equipment-lifecycle 设备全生命周期
   - "记录", "预约维保"
[84] /materials 物资管理
   - "扫描", "物资库存"
[87] /contrast/inventory 对比剂库存
   - "出入库记录", "入库登记"
[88] /contrast/quality-compliance 对比剂质量合规
   - "导出报告", "生成合规报告", "全部"
[91] /mobile/nurse 移动护士端
   - "签到", "用药", "签到"
[92] /mobile/tech 移动技师端
   - "开始", "开始", "完成"
[95] /safety/patient-safety-goals 患者安全目标
   - "新建目标", "全部"
[96] /safety/radiation-safety 放射安全
   - "导出报告", "总览"
[99] /charge-items 收费项目
   - "新增项目", "全部"
[107] /cost-analysis 成本分析
   - "月度", "季度", "年度"
[114] /report-search 报告搜索
   - "搜索", "导出 CSV"
[116] /report-timeliness 报告时效
   - "今日", "近7天", "本月"
[118] /doctor-workload 医生工作量
   - "综合排行", "报告数量", "质量分"
[119] /mammo/operations 乳腺运营
   - "统计报表", "加号"
[120] /mammo/quality 乳腺质量
   - "同步", "导出报告", "筛选"
[124] /nuclear-stats 核医学统计
   - "导出报告", "刷新数据", "总览"
[125] /system/dicom-print DICOM 打印
   - "收起", "刷新"
[126] /revenue-analysis 收入分析
   - "导出报告", "收入趋势"
[127] /cost-accounting 成本核算
   - "导出报表", "成本概览"
[128] /financial-reports 财务报表
   - "打印", "导出CSV", "损益表"

### 4.2 死按钮类型统计

- **i18n key 未翻译直接渲染** (典型 BUG): 
  - /dose-track: "doseTrack.exportPatient" 等 3 个
  - /typical-cases: "batchImport", "exportCases" 等 2 个
  - 上述"??0??"乱码也是 i18n key 未替换

- **收起/折叠按钮**: 在 30+ 页面出现, 通用折叠逻辑未实现

- **Tab 切换按钮** (日/周/月, 全部/头部 等): 几乎所有统计/列表页都未实现切换逻辑

- **导出/刷新/保存/新建**: 列表类页面的顶部操作栏普遍只有 UI, 无业务逻辑

## 5. 空表 / 空列表 (1 个)

[14] /report-delivery 报告送达
   - empty components: 3 (Ant Empty 组件)
   - tables: 0, rows: 0
   - 状态: 页面无任何数据展示, 显示 3 个 "暂无数据" 提示

(其他 OK_DEAD_BTN / OK 页面存在 tables=0 但这些是数据图表页, 不算空表)

## 6. 路由错误

无 404 / 500 路由跳转错误。所有 128 个路径都成功解析到对应页面组件 (或被通配符路由重定向)。

## 7. 表格数据情况

有数据渲染的表格 (tableRows > 0):
- /worklist 工作台: 200 行
- /follow-up 随访: 100 行
- /exams 检查记录: 10 行
- /director-dashboard 院长驾驶舱: 16 行
- /cosign 报告互审/会签: 4 行
- /defect-management 缺陷管理: 18 行
- /quality/department 部门质量: 6 行
- /qc 质控: 20 行
- /ai-qc AI 质控: 15 行
- /ai-medical-device AI 医疗器械: 20 行
- /queue-call 排队叫号: 0 (但 btns=18, 应该有数据)
- /schedule 排班: 13 行
- /regional-imaging 区域影像: 4 行
- /regional-report 区域报告: 10 行
- /hie/medical-alliance 医联体: 4 行
- /national-report 国家报告: 10 行
- /term-library 术语库: 15 行
- /template-management 模板管理: 10 行
- /research 科研: 5 行
- /user-management 用户管理: 9 行
- /dictionary 数据字典: 12 行
- /device-fault 设备故障: 8 行
- /equipment-efficiency 设备效率: 5 行
- /materials 物资管理: 12 行
- /safety/adverse-events 不良事件: 3 行
- /safety/cqi 持续质量改进: 3 行
- /safety/patient-safety-goals 患者安全目标: 8 行
- /safety/rca-analysis RCA 分析: 2 行
- /safety/risk-management 风险管理: 3 行
- /cardiac/database 心电数据库: 5 行
- /cardiac/qc 心电质控: 7 行
- /operations-center 运营中心: 6 行
- /workload-heatmap 工作负荷热力图: 4 行
- /sla-policy SLA 策略: 8 行
- /report-timeliness 报告时效: 3 行
- /mammo/operations 乳腺运营: 15 行
- /mammo/quality 乳腺质量: 12 行
- /ops/devices 运营设备: 3 行
- /ops/dashboard 运营仪表盘: 5 行
- /system/dicom-print DICOM 打印: 27 行

## 8. 数据不显示的页面 (tables=0 且页面是数据列表型)

以下页面的主要功能是展示列表/表格, 但实际没有渲染表格 (rows=0):
- /report-export 报告导出 (0 rows, 0 empty)
- /report-delivery 报告送达 (3 empty components)
- /critical-value 危急值 (96 btns, 0 rows, 0 empty) ← 应该有数据
- /critical-value-center 危急值中心 (3 btns, 0 rows)
- /critical-value-rule 危急值规则 (0 rows, 无 empty)
- /critical-value-stats 危急值统计 (0 rows, 无 empty)
- /workload-heatmap 工作负荷热力图 (有 4 rows, 4 cells 应该是热力图)
- /finance/patient 患者财务 (0 rows, 无 empty)
- /accounts-receivable 应收账款 (0 rows, 无 empty)
- /charge-items 收费项目 (0 rows)
- /revenue-analysis 收入分析 (0 rows)
- /cost-accounting 成本核算 (0 rows)
- /financial-reports 财务报表 (0 rows)
- /mammo/operations/mammo/quality 等若干 (部分有数据)
- /ai-structured-report AI 结构化报告 (0 rows, 14 btns, 应有病例列表)

## 9. 关键 Bug 总结 (按严重程度)

### P0 - 阻塞级 (页面不可用)
1. **/insurance-audit** 医保审核 — `t is not defined` 导致整页崩溃
2. **/dictionary** 数据字典 — React error #310 违反 Hooks 规则

### P1 - 严重 (核心功能缺失)
3. **/equipment-efficiency** 设备效率 — Recharts 非法 transform 字符串
4. **88 个页面存在死按钮** — 大量"收起"、"全部"、"导出"按钮无响应
5. **i18n key 未翻译** — /dose-track, /typical-cases 等页面显示原始 key 给用户

### P2 - 中等
6. **/report-delivery 报告送达** — 3 个空状态组件, 完全无数据
7. **/enterprise-search 企业搜索** — 后端 /api/v1/search 500 错误
8. **/mock-images/** 下 3 张 CT/MR 静态图片 404 缺失

### P3 - 轻微
9. **大量 Tab 切换按钮 (近7天/30天/90天, 月度/季度/年度 等)** 不响应
10. **多页面的"收起"按钮** 通用折叠逻辑缺失

## 10. 截图保存位置

E:\opencode work\FS\G005-RISv-3.0.0\test-screenshots\deep\001-xxx.png 至 128-xxx.png
- 128 张截图, 每页 1 张
- 文件名格式: `{序号}-{中文页面名}.png`
- 注意: 截图经过 PowerShell 渲染, 中文文件名可能显示为乱码 (??)
- 可按页码 (001-128) 索引对应到报告里的 idx 字段

## 11. 报告产物清单

- E:\opencode work\FS\G005-RISv-3.0.0\test-reports\deep-test-report.json — 128 页详细结果
- E:\opencode work\FS\G005-RISv-3.0.0\test-reports\errors.json — 11 条 console 错误
- E:\opencode work\FS\G005-RISv-3.0.0\test-reports\dead-buttons.json — 155 个死按钮
- E:\opencode work\FS\G005-RISv-3.0.0\test-reports\run-output-v2.txt — 完整控制台输出
- E:\opencode work\FS\G005-RISv-3.0.0\test-screenshots\deep\ — 128 张截图
- E:\opencode work\FS\G005-RISv-3.0.0\pw-deep-50plus.mjs — 测试脚本 (可重复执行)
