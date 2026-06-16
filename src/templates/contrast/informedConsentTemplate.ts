export interface InformedConsentData {
  patientId: string
  patientName: string
  gender: string
  age: number
  idNumber: string
  inpatientNo?: string
  examName: string
  modality: string
  contrastName: string
  contrastGenericName: string
  route: string
  dose: string
  indication: string
  attendingPhysician: string
  hospitalName: string
  risks: string[]
  benefits: string[]
  alternatives: string[]
  patientStatement: string
  patientSignature?: string
  patientSignedAt?: string
  physicianSignature?: string
  physicianSignedAt?: string
  witnessSignature?: string
  createdAt: string
}

const DEFAULT_RISKS = [
  '过敏反应：荨麻疹、面部潮红、呼吸困难、喉头水肿、过敏性休克',
  '造影剂肾病：血肌酐升高，严重时需透析治疗',
  '造影剂外渗：局部肿胀、疼痛，严重时皮肤坏死',
  '心血管反应：血压下降、心律失常',
  '神经系统反应：头痛、眩晕、抽搐',
]

const DEFAULT_BENEFITS = [
  '提高病变检出率，发现平扫难以显示的病灶',
  '明确病变的血供特点，辅助定性诊断',
  '评估肿瘤的血供情况及治疗后疗效',
  '显示血管结构及血管性疾病',
]

const DEFAULT_ALTERNATIVES = [
  '非增强CT/MR检查',
  '超声检查（超声造影）',
  '核医学检查',
  '定期随访观察',
]

export function generateInformedConsentHtml(data: InformedConsentData): string {
  const risks = data.risks.length > 0 ? data.risks : DEFAULT_RISKS
  const benefits = data.benefits.length > 0 ? data.benefits : DEFAULT_BENEFITS
  const alternatives = data.alternatives.length > 0 ? data.alternatives : DEFAULT_ALTERNATIVES

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>对比剂使用知情同意书</title>
<style>
  body { font-family: 'SimSun', serif; font-size: 14px; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { text-align: center; font-size: 20px; margin-bottom: 24px; }
  h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; }
  td, th { border: 1px solid #333; padding: 6px 10px; text-align: left; }
  .signature { margin-top: 40px; display: flex; justify-content: space-between; }
  .sig-line { margin-top: 40px; }
  .sig-line p { border-top: 1px solid #333; width: 200px; text-align: center; padding-top: 4px; }
</style></head>
<body>
  <h1>对比剂使用知情同意书</h1>
  <p style="text-align:center;color:#666;">${data.hospitalName}</p>

  <h2>患者基本信息</h2>
  <table>
    <tr><td width="120">姓名</td><td>${data.patientName}</td><td width="80">性别</td><td>${data.gender}</td></tr>
    <tr><td>年龄</td><td>${data.age}岁</td><td>病历号</td><td>${data.patientId}</td></tr>
    <tr><td>身份证号</td><td colspan="3">${data.idNumber}</td></tr>
    ${data.inpatientNo ? `<tr><td>住院号</td><td colspan="3">${data.inpatientNo}</td></tr>` : ''}
  </table>

  <h2>检查信息</h2>
  <table>
    <tr><td width="120">检查项目</td><td>${data.examName}</td></tr>
    <tr><td>检查方式</td><td>${data.modality}</td></tr>
    <tr><td>对比剂名称</td><td>${data.contrastName}（${data.contrastGenericName}）</td></tr>
    <tr><td>给药途径</td><td>${data.route}</td></tr>
    <tr><td>推荐剂量</td><td>${data.dose}</td></tr>
    <tr><td>检查指征</td><td>${data.indication}</td></tr>
    <tr><td>申请医师</td><td>${data.attendingPhysician}</td></tr>
  </table>

  <h2>检查目的及预期获益</h2>
  <ul>${benefits.map(b => `<li>${b}</li>`).join('')}</ul>

  <h2>潜在风险及并发症</h2>
  <ul>${risks.map(r => `<li>${r}</li>`).join('')}</ul>
  <p>以上风险并非全部，具体个体差异请咨询医师。如有不适，请立即告知医护人员。</p>

  <h2>替代检查方案</h2>
  <ul>${alternatives.map(a => `<li>${a}</li>`).join('')}</ul>

  <h2>患者声明</h2>
  <p>${data.patientStatement || '本人已仔细阅读（或由医护人员宣读）以上内容，理解对比剂使用的目的、风险及替代方案。本人有充分的机会提问，并得到满意的答复。本人自愿接受使用对比剂进行此项检查，并配合医护人员做好相关准备。'}</p>

  <div class="signature">
    <div class="sig-line">
      <p>患者/家属签名</p>
      ${data.patientSignature ? `<p>${data.patientSignature}</p>` : '<p style="border:none;">_____________</p>'}
      <p>${data.patientSignedAt ? new Date(data.patientSignedAt).toLocaleString('zh-CN') : '____年__月__日'}</p>
    </div>
    <div class="sig-line">
      <p>医师签名</p>
      ${data.physicianSignature ? `<p>${data.physicianSignature}</p>` : '<p style="border:none;">_____________</p>'}
      <p>${data.physicianSignedAt ? new Date(data.physicianSignedAt).toLocaleString('zh-CN') : '____年__月__日'}</p>
    </div>
  </div>
</body></html>`
}

export function generateInformedConsentText(data: InformedConsentData): string {
  const risks = data.risks.length > 0 ? data.risks : DEFAULT_RISKS
  const benefits = data.benefits.length > 0 ? data.benefits : DEFAULT_BENEFITS
  const alternatives = data.alternatives.length > 0 ? data.alternatives : DEFAULT_ALTERNATIVES

  return [
    `对比剂使用知情同意书`,
    `${data.hospitalName}`,
    ``,
    `患者姓名: ${data.patientName}  性别: ${data.gender}  年龄: ${data.age}岁  病历号: ${data.patientId}`,
    `检查项目: ${data.examName} (${data.modality})`,
    `对比剂: ${data.contrastName} (${data.contrastGenericName})`,
    `给药途径: ${data.route}  推荐剂量: ${data.dose}`,
    `检查指征: ${data.indication}`,
    ``,
    `检查目的及预期获益:`,
    ...benefits.map(b => `  - ${b}`),
    ``,
    `潜在风险及并发症:`,
    ...risks.map(r => `  - ${r}`),
    ``,
    `替代检查方案:`,
    ...alternatives.map(a => `  - ${a}`),
    ``,
    `患者声明: ${data.patientStatement || '本人已仔细阅读以上内容，理解对比剂使用的目的、风险及替代方案。本人自愿接受使用对比剂。'}`,
    ``,
    `患者签名: ${data.patientSignature || '_____________'}  日期: ${data.patientSignedAt ? new Date(data.patientSignedAt).toLocaleString('zh-CN') : '____年__月__日'}`,
    `医师签名: ${data.physicianSignature || '_____________'}  日期: ${data.physicianSignedAt ? new Date(data.physicianSignedAt).toLocaleString('zh-CN') : '____年__月__日'}`,
  ].join('\n')
}
