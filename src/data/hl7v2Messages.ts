/**
 * G005 放射RIS系统 v3.0.6.0 - HL7 v2.x 报文样本数据
 * 20+ 条覆盖 ADT/ORM/ORU/DFT/MDM 报文类型,含中文姓名
 */

export interface Hl7MessageSample {
  id: string;
  name: string;
  nameEn: string;
  type: string;
  trigger: string;
  version: string;
  scenario: string;
  message: string;
  expectedControlId?: string;
  encoding: string;
}

export const HL7V2_SAMPLES: Hl7MessageSample[] = [
  {
    id: 'hl7-adt-a01-001',
    name: 'ADT^A01 入院登记',
    nameEn: 'ADT^A01 Admit/visit notification',
    type: 'ADT', trigger: 'A01', version: '2.5', scenario: '门诊 CT 检查登记',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619103000||ADT^A01|MSG-A01-001|P|2.5',
      'EVN|A01|20260619103000',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M|||北京市朝阳区建国路1号||13800138001',
      'PV1||O|CT^CT室^001||||||||||||V001|||||||||||||||||||||||||20260619103000',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a03-001',
    name: 'ADT^A03 出院',
    nameEn: 'ADT^A03 Discharge/end visit',
    type: 'ADT', trigger: 'A03', version: '2.5', scenario: '住院患者出院',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260620093000||ADT^A03|MSG-A03-001|P|2.5',
      'EVN|A03|20260620093000',
      'PID|1||P0002^^^HOSPITAL^MR||李四^李^四||19750512|F|||上海市黄浦区南京路100号',
      'PV1||I|外科^外科楼^301||||D001^王医生||||||||||||VN0001|||||||||||||||||||||||||20260620093000',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a04-001',
    name: 'ADT^A04 门诊登记',
    nameEn: 'ADT^A04 Register a patient',
    type: 'ADT', trigger: 'A04', version: '2.5', scenario: '门诊就诊登记',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619140000||ADT^A04|MSG-A04-001|P|2.5',
      'EVN|A04|20260619140000',
      'PID|1||P0003^^^HOSPITAL^MR||王五^王^五||19900315|M',
      'PV1||O|MR^MR室^201',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a08-001',
    name: 'ADT^A08 更新患者信息',
    nameEn: 'ADT^A08 Update patient information',
    type: 'ADT', trigger: 'A08', version: '2.5', scenario: '修改联系电话',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619150000||ADT^A08|MSG-A08-001|P|2.5',
      'EVN|A08|20260619150000',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M|||北京市朝阳区建国路2号||13900000001',
    ].join('\r'),
  },
  {
    id: 'hl7-orm-o01-001',
    name: 'ORM^O01 检查申请',
    nameEn: 'ORM^O01 Order message',
    type: 'ORM', trigger: 'O01', version: '2.5', scenario: '胸部 CT 增强检查申请',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RIS|G005|20260619093000||ORM^O01|MSG-ORM-001|P|2.5',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M',
      'PV1||O|CT^CT室^001',
      'ORC|NW|ORD-2026-0001|||||1^once^20260619093000|||D001^王医生^MD',
      'OBR|1|ORD-2026-0001||CT-CHEST-ENH^胸部CT增强^L|||20260619110000|||||||||D001^王医生^MD||||||CT',
    ].join('\r'),
  },
  {
    id: 'hl7-orm-o01-002',
    name: 'ORM^O01 取消申请',
    nameEn: 'ORM^O01 Cancel order',
    type: 'ORM', trigger: 'O01', version: '2.5', scenario: '取消 MR 检查',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RIS|G005|20260619120000||ORM^O01|MSG-ORM-002|P|2.5',
      'PID|1||P0004^^^HOSPITAL^MR||赵六^赵^六||19850520|F',
      'ORC|CA|ORD-2026-0002',
      'OBR|1|ORD-2026-0002',
    ].join('\r'),
  },
  {
    id: 'hl7-oru-r01-001',
    name: 'ORU^R01 检查结果',
    nameEn: 'ORU^R01 Observation result',
    type: 'ORU', trigger: 'R01', version: '2.5', scenario: 'CT 报告结果',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260619140000||ORU^R01|MSG-ORU-001|P|2.5',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M',
      'OBR|1|ACC-2026-0001||CT-CHEST-ENH^胸部CT增强^L|||20260619133000|||||||||D001^王医生^MD||||||CT',
      'OBX|1|TX|FINDING^影像所见^L||右肺上叶可见一结节,直径约 12mm,边缘不规则,呈分叶状',
      'OBX|2|TX|IMPRESSION^诊断意见^L||右肺上叶周围型肺癌可能性大,建议穿刺活检',
      'OBX|3|NM|DIAMETER^结节直径^L||12|mm',
    ].join('\r'),
  },
  {
    id: 'hl7-oru-r01-002',
    name: 'ORU^R01 MR 报告',
    nameEn: 'ORU^R01 MR report',
    type: 'ORU', trigger: 'R01', version: '2.5', scenario: '脑部 MR 平扫',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260620093000||ORU^R01|MSG-ORU-002|P|2.5',
      'PID|1||P0005^^^HOSPITAL^MR||孙七^孙^七||19700210|M',
      'OBR|1|ACC-2026-0010||MR-BRAIN-PLAIN^脑部MR平扫^L|||20260620090000',
      'OBX|1|TX|FINDING||双侧大脑半球对称,脑沟、脑池、脑室未见异常',
      'OBX|2|TX|IMPRESSION||颅脑 MR 平扫未见明显异常',
    ].join('\r'),
  },
  {
    id: 'hl7-dft-p03-001',
    name: 'DFT^P03 财务交易',
    nameEn: 'DFT^P03 Post detail financial transaction',
    type: 'DFT', trigger: 'P03', version: '2.5', scenario: 'CT 检查收费',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|BILLING|H001|RECEIVER|FACILITY|20260619150000||DFT^P03|MSG-DFT-001|P|2.5',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M',
      'PV1||O',
      'FT1|1|TX-001|20260619150000|CT^胸部CT^L|850.00|人民币|1',
    ].join('\r'),
  },
  {
    id: 'hl7-mdm-t02-001',
    name: 'MDM^T02 原始文档',
    nameEn: 'MDM^T02 Original document notify',
    type: 'MDM', trigger: 'T02', version: '2.5', scenario: '发送报告原文',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260619150000||MDM^T02|MSG-MDM-001|P|2.5',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M',
      'PV1||O',
      'TXA|1|REP-001|TX^文本^L|RP^报告^L|20260619150000|D001^王医生^MD|||AV^available^L',
    ].join('\r'),
  },
  {
    id: 'hl7-ack-aa-001',
    name: 'ACK^AA 应用层接受',
    nameEn: 'ACK^AA - Application Accept',
    type: 'ACK', trigger: 'AA', version: '2.5', scenario: '对 ADT^A01 的确认',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RECEIVER|FACILITY|RIS|G005|20260619103005||ACK|MSG-ACK-001|P|2.5',
      'MSA|AA|MSG-A01-001|Message accepted',
    ].join('\r'),
  },
  {
    id: 'hl7-ack-ae-001',
    name: 'ACK^AE 应用层错误',
    nameEn: 'ACK^AE - Application Error',
    type: 'ACK', trigger: 'AE', version: '2.5', scenario: 'MSH-9 缺失',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RECEIVER|FACILITY|RIS|G005|20260619103005||ACK|MSG-ACK-002|P|2.5',
      'MSA|AE|MSG-ERR-001|MSH-9 missing',
      'ERR|||MSH^9^1|100^required field missing^HL70357|E',
    ].join('\r'),
  },
  {
    id: 'hl7-qbp-q22-001',
    name: 'QBP^Q22 查找候选患者',
    nameEn: 'QBP^Q22 Find Candidates',
    type: 'QBP', trigger: 'Q22', version: '2.5', scenario: 'PDQ 按姓名查询',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|PDQ|FACILITY|20260619160000||QBP^Q22|MSG-QBP-001|P|2.5',
      'QPD|IHE PDQ Query^IHE PDQ Query^IHE|Q001|@PID.5.1^张三~@PID.7^19800101',
      'RCP|I|10^RD',
    ].join('\r'),
  },
  {
    id: 'hl7-rsp-k22-001',
    name: 'RSP^K22 PDQ 响应',
    nameEn: 'RSP^K22 PDQ Response',
    type: 'RSP', trigger: 'K22', version: '2.5', scenario: 'PDQ 命中 1 名患者',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|PDQ|FACILITY|RIS|G005|20260619160000||RSP^K22|MSG-RSP-001|P|2.5',
      'MSA|AA|MSG-QBP-001',
      'QAK|Q001|OK|IHE PDQ Query|1',
      'QPD|IHE PDQ Query^IHE PDQ Query^IHE|Q001|@PID.5.1^张三',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三||19800101|M',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a11-001',
    name: 'ADT^A11 取消入院',
    nameEn: 'ADT^A11 Cancel admit/visit notification',
    type: 'ADT', trigger: 'A11', version: '2.5', scenario: '取消入院',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619170000||ADT^A11|MSG-A11-001|P|2.5',
      'EVN|A11|20260619170000',
      'PID|1||P0006^^^HOSPITAL^MR||周八^周^八||19900805|M',
      'PV1||I',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a13-001',
    name: 'ADT^A13 取消出院',
    nameEn: 'ADT^A13 Cancel discharge/end visit',
    type: 'ADT', trigger: 'A13', version: '2.5', scenario: '撤回出院',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619180000||ADT^A13|MSG-A13-001|P|2.5',
      'EVN|A13|20260619180000',
      'PID|1||P0007^^^HOSPITAL^MR||吴九^吴^九||19650730|M',
    ].join('\r'),
  },
  {
    id: 'hl7-orm-o01-003',
    name: 'ORM^O01 修改申请',
    nameEn: 'ORM^O01 Modify order',
    type: 'ORM', trigger: 'O01', version: '2.5', scenario: '将检查改为增强',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RIS|G005|20260619190000||ORM^O01|MSG-ORM-003|P|2.5',
      'PID|1||P0008^^^HOSPITAL^MR||郑十^郑^十||19820925|F',
      'ORC|XO|ORD-2026-0050',
      'OBR|1|ORD-2026-0050||CT-ABDOMEN-ENH^腹部CT增强^L',
    ].join('\r'),
  },
  {
    id: 'hl7-oru-r01-003',
    name: 'ORU^R01 含重复 OBX',
    nameEn: 'ORU^R01 with repeating OBX',
    type: 'ORU', trigger: 'R01', version: '2.5', scenario: '多个肺结节测量',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260619200000||ORU^R01|MSG-ORU-003|P|2.5',
      'PID|1||P0009^^^HOSPITAL^MR||陈一^陈^一||19600101|M',
      'OBR|1|ACC-2026-0020||CT-CHEST^胸部CT^L',
      'OBX|1|NM|NODULE1^结节1直径^L||12|mm',
      'OBX|2|NM|NODULE2^结节2直径^L||8|mm',
      'OBX|3|NM|NODULE3^结节3直径^L||5|mm',
    ].join('\r'),
  },
  {
    id: 'hl7-dft-p03-002',
    name: 'DFT^P03 多笔交易',
    nameEn: 'DFT^P03 Multiple transactions',
    type: 'DFT', trigger: 'P03', version: '2.5', scenario: 'CT + MR 组合',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|BILLING|H001|RECEIVER|FACILITY|20260619210000||DFT^P03|MSG-DFT-002|P|2.5',
      'PID|1||P0010^^^HOSPITAL^MR||林二^林^二||19880318|M',
      'FT1|1|TX-002|20260619210000|CT^胸部CT^L|850.00|人民币|1',
      'FT1|2|TX-003|20260619210000|MR^脑部MR^L|1200.00|人民币|1',
    ].join('\r'),
  },
  {
    id: 'hl7-mdm-t04-001',
    name: 'MDM^T04 状态更新',
    nameEn: 'MDM^T04 Document status update',
    type: 'MDM', trigger: 'T04', version: '2.5', scenario: '报告签发',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260619220000||MDM^T04|MSG-MDM-002|P|2.5',
      'PID|1||P0001^^^HOSPITAL^MR||张三^张^三',
      'TXA|1|REP-001|TX^文本^L|RP^报告^L|20260619220000|D001^王医生^MD|||AV^available^L',
    ].join('\r'),
  },
  {
    id: 'hl7-adt-a12-001',
    name: 'ADT^A12 取消转科',
    nameEn: 'ADT^A12 Cancel transfer',
    type: 'ADT', trigger: 'A12', version: '2.5', scenario: '撤回转科',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|HIS|H001|RECEIVER|FACILITY|20260619230000||ADT^A12|MSG-A12-001|P|2.5',
      'EVN|A12|20260619230000',
      'PID|1||P0011^^^HOSPITAL^MR||何三^何^三||19710308|M',
    ].join('\r'),
  },
  {
    id: 'hl7-oru-r01-004',
    name: 'ORU^R01 钼靶报告',
    nameEn: 'ORU^R01 Mammography report',
    type: 'ORU', trigger: 'R01', version: '2.5', scenario: 'BI-RADS 4 类',
    encoding: 'UTF-8',
    message: [
      'MSH|^~\\&|RIS|G005|EMR|FACILITY|20260620080000||ORU^R01|MSG-ORU-004|P|2.5',
      'PID|1||P0012^^^HOSPITAL^MR||高四^高^四||19720522|F',
      'OBR|1|ACC-2026-0030||MG-BIL^双侧钼靶^L',
      'OBX|1|TX|FINDING||右乳外上象限可见一肿块,边缘呈毛刺状',
      'OBX|2|CE|BIRADS^BI-RADS分类^L||4^可疑恶性^L',
    ].join('\r'),
  },
];

export function getHl7v2Sample(id: string): Hl7MessageSample | undefined {
  return HL7V2_SAMPLES.find((s) => s.id === id);
}

export function getHl7v2SamplesByType(type: string): Hl7MessageSample[] {
  return HL7V2_SAMPLES.filter((s) => s.type === type);
}
