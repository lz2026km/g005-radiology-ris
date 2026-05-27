// @ts-nocheck
// ============================================================
// G005 放射科RIS系统 - ICD-10计算机辅助编码助手
// 提供诊断编码查询、分类浏览、代码详情查看功能
// ============================================================
import { useState, useMemo } from 'react'
import {
  Search, FileText, X, ChevronRight, ChevronDown, BookOpen,
  ClipboardList, Filter, RefreshCw, Check, AlertCircle,
  Stethoscope, Brain, Heart, Bone, Kidney, Lungs, GitFork,
  Zap, Microscope, Activity, Scan, TestTube, StickyNote,
  Syringe, Wind, Droplets, Eye, ScanLine, Cpu
} from 'lucide-react'

// ==================== ICD-10编码数据（200+条）====================
const ICD10_CODES = [
  // ========== 神经系统 ==========
  { code: 'I63.900', name: '脑梗死', category: '神经系统', description: '未特指的脑梗死', examItems: ['头颅CT平扫', '头颅CT增强', '头颅MRI平扫', '头颅MRI增强', '头颅CTA'] },
  { code: 'I61.900', name: '脑出血', category: '神经系统', description: '未特指的脑出血', examItems: ['头颅CT平扫', '头颅MRI平扫', '头颅CTA'] },
  { code: 'I60.900', name: '蛛网膜下腔出血', category: '神经系统', description: '未特指的蛛网膜下腔出血', examItems: ['头颅CT平扫', '头颅CTA', '脑血管DSA'] },
  { code: 'I60.000', name: '颈内动脉动脉瘤破裂引起的蛛网膜下腔出血', category: '神经系统', description: '颈内动脉动脉瘤破裂引起的SAH', examItems: ['头颅CTA', '脑血管DSA'] },
  { code: 'G40.900', name: '癫痫', category: '神经系统', description: '未特指的癫痫', examItems: ['头颅MRI平扫', '头颅MRI增强', '脑电图'] },
  { code: 'G35.000', name: '多发性硬化', category: '神经系统', description: '多发性硬化的脑干综合征', examItems: ['头颅MRI平扫', '头颅MRI增强', '颈椎MRI'] },
  { code: 'G43.900', name: '偏头痛', category: '神经系统', description: '未特指的偏头痛', examItems: ['头颅CT平扫', '头颅MRI平扫'] },
  { code: 'G47.000', name: '嗜睡症', category: '神经系统', description: '嗜睡症', examItems: ['头颅MRI平扫', '多导睡眠监测'] },
  { code: 'I67.100', name: '脑动脉瘤', category: '神经系统', description: '未特指的脑动脉瘤', examItems: ['头颅CTA', '脑血管DSA', '头颅MRA'] },
  { code: 'I67.200', name: '脑动静脉畸形', category: '神经系统', description: '脑动静脉畸形', examItems: ['头颅CTA', '脑血管DSA', '头颅MRA'] },
  { code: 'S06.300', name: '脑挫伤', category: '神经系统', description: '局灶性脑损伤', examItems: ['头颅CT平扫', '头颅MRI平扫'] },
  { code: 'S06.200', name: '脑震荡', category: '神经系统', description: '未特指的脑震荡', examItems: ['头颅CT平扫'] },
  { code: 'I63.000', name: '大脑前动脉脑梗死', category: '神经系统', description: '大脑前动脉脑梗死', examItems: ['头颅CT平扫', '头颅MRI平扫', '头颅CTA'] },
  { code: 'I63.100', name: '大脑中动脉脑梗死', category: '神经系统', description: '大脑中动脉脑梗死', examItems: ['头颅CT平扫', '头颅MRI平扫', '头颅CTA'] },
  { code: 'I63.200', name: '大脑后动脉脑梗死', category: '神经系统', description: '大脑后动脉脑梗死', examItems: ['头颅CT平扫', '头颅MRI平扫', '头颅CTA'] },
  { code: 'I63.300', name: '小脑后动脉脑梗死', category: '神经系统', description: '小脑后动脉脑梗死', examItems: ['头颅MRI平扫', '头颅CTA'] },
  { code: 'I64.000', name: '椎基底动脉脑梗死', category: '神经系统', description: '椎基底动脉脑梗死', examItems: ['头颅MRI平扫', '头颅CTA', '脑血管DSA'] },

  // ========== 呼吸系统 ==========
  { code: 'J18.900', name: '肺炎', category: '呼吸系统', description: '未特指的肺炎', examItems: ['胸部CT平扫', '胸部CT增强', '胸部DR正侧位'] },
  { code: 'J44.100', name: '慢性阻塞性肺病', category: '呼吸系统', description: '慢性支气管炎伴肺气肿', examItems: ['胸部CT平扫', '胸部DR正侧位', '肺功能测定'] },
  { code: 'J45.900', name: '哮喘', category: '呼吸系统', description: '未特指的哮喘', examItems: ['胸部CT平扫', '胸部DR正侧位', '肺功能测定'] },
  { code: 'C34.900', name: '肺癌', category: '呼吸系统', description: '未特指部位的支气管或肺恶性肿瘤', examItems: ['胸部CT平扫', '胸部CT增强', 'PET-CT', '肺穿刺活检'] },
  { code: 'J90.000', name: '胸腔积液', category: '呼吸系统', description: '未特指的胸腔积液', examItems: ['胸部CT平扫', '胸部DR正侧位', '胸部超声'] },
  { code: 'J93.900', name: '气胸', category: '呼吸系统', description: '未特指的气胸', examItems: ['胸部DR正侧位', '胸部CT平扫'] },
  { code: 'J94.200', name: '血胸', category: '呼吸系统', description: '血胸', examItems: ['胸部CT平扫', '胸部DR正侧位'] },
  { code: 'J96.000', name: '急性呼吸衰竭', category: '呼吸系统', description: '急性呼吸衰竭', examItems: ['胸部CT平扫', '血气分析'] },
  { code: 'J98.400', name: '肺间质病变', category: '呼吸系统', description: '未特指的肺间质疾病', examItems: ['胸部CT平扫', '胸部HRCT', '肺功能测定'] },
  { code: 'R91.000', name: '肺结节', category: '呼吸系统', description: '肺部阴影', examItems: ['胸部CT平扫', '胸部CT增强', 'PET-CT'] },
  { code: 'D86.000', name: '结节病', category: '呼吸系统', description: '结节病', examItems: ['胸部CT平扫', '胸部CT增强'] },
  { code: 'J18.000', name: '大叶性肺炎', category: '呼吸系统', description: '大叶性肺炎', examItems: ['胸部DR正侧位', '胸部CT平扫'] },
  { code: 'J18.100', name: '小叶性肺炎', category: '呼吸系统', description: '小叶性肺炎', examItems: ['胸部DR正侧位', '胸部CT平扫'] },
  { code: 'J32.900', name: '慢性鼻窦炎', category: '呼吸系统', description: '未特指的慢性鼻窦炎', examItems: ['副鼻窦CT', '鼻窦片'] },
  { code: 'J34.200', name: '鼻中隔偏曲', category: '呼吸系统', description: '鼻中隔偏曲', examItems: ['副鼻窦CT'] },

  // ========== 消化系统 ==========
  { code: 'K76.000', name: '肝血管瘤', category: '消化系统', description: '肝血管瘤', examItems: ['腹部CT平扫', '腹部CT增强', '腹部MRI平扫', '腹部彩超'] },
  { code: 'C22.000', name: '原发性肝癌', category: '消化系统', description: '肝细胞癌', examItems: ['腹部CT平扫', '腹部CT增强', '腹部MRI平扫', 'PET-CT'] },
  { code: 'K80.200', name: '胆囊结石', category: '消化系统', description: '胆囊结石伴慢性胆囊炎', examItems: ['腹部彩超', '腹部CT平扫', 'MRCP'] },
  { code: 'K85.900', name: '急性胰腺炎', category: '消化系统', description: '未特指的急性胰腺炎', examItems: ['腹部CT平扫', '腹部CT增强', '腹部MRI平扫'] },
  { code: 'K81.000', name: '急性胆囊炎', category: '消化系统', description: '急性胆囊炎', examItems: ['腹部彩超', '腹部CT平扫', 'MRCP'] },
  { code: 'K70.300', name: '酒精性肝硬化', category: '消化系统', description: '酒精性肝硬化', examItems: ['腹部CT平扫', '腹部MRI平扫', '腹部彩超'] },
  { code: 'K76.600', name: '门静脉高压', category: '消化系统', description: '门静脉高压', examItems: ['腹部CT增强', '腹部MRI平扫', '腹部彩超'] },
  { code: 'C78.700', name: '肝继发性恶性肿瘤', category: '消化系统', description: '肝继发性恶性肿瘤', examItems: ['腹部CT平扫', '腹部CT增强', 'PET-CT'] },
  { code: 'K80.000', name: '胆囊结石', category: '消化系统', description: '胆囊结石', examItems: ['腹部彩超', '腹部CT平扫'] },
  { code: 'K80.100', name: '胆管结石', category: '消化系统', description: '胆管结石', examItems: ['腹部CT平扫', 'MRCP', 'ERCP'] },
  { code: 'K86.800', name: '胰腺囊肿', category: '消化系统', description: '胰腺囊肿', examItems: ['腹部CT增强', '腹部MRI平扫', 'MRCP'] },
  { code: 'C25.000', name: '胰腺癌', category: '消化系统', description: '胰头恶性肿瘤', examItems: ['腹部CT增强', '腹部MRI平扫', 'PET-CT'] },
  { code: 'C18.900', name: '结肠癌', category: '消化系统', description: '结肠恶性肿瘤', examItems: ['腹部CT平扫', '腹部CT增强', 'PET-CT', '肠镜'] },
  { code: 'C16.900', name: '胃癌', category: '消化系统', description: '胃恶性肿瘤', examItems: ['腹部CT增强', '胃镜', 'PET-CT'] },
  { code: 'K63.500', name: '结肠息肉', category: '消化系统', description: '结肠息肉', examItems: ['腹部CT平扫', '肠镜', 'CT仿真结肠镜'] },
  { code: 'K57.900', name: '肠憩室病', category: '消化系统', description: '肠憩室病', examItems: ['腹部CT平扫', '腹部CT增强'] },

  // ========== 心血管系统 ==========
  { code: 'I25.100', name: '冠心病', category: '心血管系统', description: '动脉粥样硬化性心脏病', examItems: ['冠脉CTA', '心脏DSA', '心肌灌注显像', '心脏彩超'] },
  { code: 'I11.900', name: '高血压性心脏病', category: '心血管系统', description: '未特指的高血压心脏病', examItems: ['心脏彩超', '胸部CT平扫', '心电图'] },
  { code: 'I50.000', name: '充血性心力衰竭', category: '心血管系统', description: '充血性心力衰竭', examItems: ['心脏彩超', '心脏MRI', '胸部CT平扫'] },
  { code: 'I48.900', name: '心房颤动', category: '心血管系统', description: '未特指的心房颤动', examItems: ['心电图', '心脏彩超', '动态心电图'] },
  { code: 'I51.900', name: '心脏病', category: '心血管系统', description: '未特指的心脏病', examItems: ['心脏彩超', '心电图', '冠脉CTA'] },
  { code: 'I70.000', name: '主动脉粥样硬化', category: '心血管系统', description: '主动脉粥样硬化', examItems: ['主动脉CTA', '胸部CT平扫'] },
  { code: 'I71.400', name: '腹主动脉瘤', category: '心血管系统', description: '腹主动脉瘤', examItems: ['主动脉CTA', '腹部CT增强', '腹部彩超'] },
  { code: 'I71.000', name: '主动脉夹层', category: '心血管系统', description: '主动脉夹层', examItems: ['主动脉CTA', '胸部CT增强'] },
  { code: 'I74.200', name: '肠系膜动脉栓塞', category: '心血管系统', description: '肠系膜动脉栓塞', examItems: ['腹部CT增强', '腹部CTA'] },
  { code: 'I80.100', name: '股静脉血栓', category: '心血管系统', description: '股静脉血栓形成', examItems: ['下肢血管彩超', '下肢CTV'] },
  { code: 'I80.200', name: '髂静脉血栓', category: '心血管系统', description: '髂静脉血栓形成', examItems: ['下腹部CT增强', '下肢血管彩超'] },
  { code: 'R03.100', name: '低血压', category: '心血管系统', description: '低血压', examItems: ['心脏彩超', '心电图'] },
  { code: 'I73.900', name: '外周血管病', category: '心血管系统', description: '未特指的外周血管病', examItems: ['下肢血管彩超', '下肢CTA', '外周血管DSA'] },
  { code: 'I77.100', name: '颈动脉狭窄', category: '心血管系统', description: '颈动脉狭窄', examItems: ['颈部血管彩超', '颈部CTA', '脑血管DSA'] },

  // ========== 骨骼系统 ==========
  { code: 'M54.500', name: '腰痛', category: '骨骼系统', description: '未特指的腰痛', examItems: ['腰椎MR', '腰椎DR正侧位', '腰椎CT'] },
  { code: 'M47.900', name: '颈椎病', category: '骨骼系统', description: '未特指的脊椎病', examItems: ['颈椎MR', '颈椎DR正侧位', '颈椎CT'] },
  { code: 'S72.000', name: '股骨颈骨折', category: '骨骼系统', description: '股骨颈骨折', examItems: ['髋关节DR', '髋关节CT', '髋关节MRI'] },
  { code: 'S82.000', name: '髌骨骨折', category: '骨骼系统', description: '髌骨骨折', examItems: ['膝关节DR', '膝关节CT'] },
  { code: 'M80.000', name: '骨质疏松性骨折', category: '骨骼系统', description: '绝经后骨质疏松性骨折', examItems: ['骨密度测定', '腰椎MR', '胸椎DR正侧位'] },
  { code: 'M81.000', name: '骨质疏松', category: '骨骼系统', description: '绝经后骨质疏松', examItems: ['骨密度测定', '腰椎DR正侧位'] },
  { code: 'M17.900', name: '膝关节骨关节炎', category: '骨骼系统', description: '未特指的膝关节病', examItems: ['膝关节DR', '膝关节MR', '膝关节CT'] },
  { code: 'M16.900', name: '髋关节骨关节炎', category: '骨骼系统', description: '未特指的髋关节病', examItems: ['髋关节DR', '髋关节MR', '髋关节CT'] },
  { code: 'S22.300', name: '肋骨骨折', category: '骨骼系统', description: '肋骨骨折', examItems: ['胸部DR正侧位', '肋骨CT三维重建'] },
  { code: 'S32.000', name: '腰椎骨折', category: '骨骼系统', description: '第一腰椎骨折', examItems: ['腰椎DR正侧位', '腰椎CT', '腰椎MRI'] },
  { code: 'S12.900', name: '颈椎骨折', category: '骨骼系统', description: '未特指的颈椎骨折', examItems: ['颈椎DR正侧位', '颈椎CT', '颈椎MRI'] },
  { code: 'M48.500', name: '椎体压缩性骨折', category: '骨骼系统', description: '椎体压缩性骨折', examItems: ['胸椎DR正侧位', '胸椎MRI', '胸椎CT'] },

  // ========== 泌尿系统 ==========
  { code: 'N28.100', name: '肾囊肿', category: '泌尿系统', description: '后天性肾囊肿', examItems: ['腹部CT平扫', '腹部彩超', '腹部MRI平扫'] },
  { code: 'C64.000', name: '肾癌', category: '泌尿系统', description: '肾细胞癌', examItems: ['腹部CT增强', '腹部MRI平扫', 'PET-CT'] },
  { code: 'N13.200', name: '肾积水', category: '泌尿系统', description: '肾积水伴肾结石', examItems: ['腹部CT平扫', '腹部彩超', '泌尿系CT', 'MRU'] },
  { code: 'N20.000', name: '肾结石', category: '泌尿系统', description: '肾结石', examItems: ['腹部CT平扫', '腹部彩超', '泌尿系CT'] },
  { code: 'N18.300', name: '慢性肾脏病', category: '泌尿系统', description: '慢性肾脏病3期', examItems: ['腹部CT平扫', '腹部彩超', '肾动态显像'] },
  { code: 'C67.900', name: '膀胱癌', category: '泌尿系统', description: '膀胱恶性肿瘤', examItems: ['盆腔CT增强', '盆腔MRI平扫', 'PET-CT'] },
  { code: 'N40.000', name: '前列腺增生', category: '泌尿系统', description: '前列腺增生', examItems: ['前列腺MR', '前列腺彩超', '盆腔CT平扫'] },
  { code: 'C61.000', name: '前列腺癌', category: '泌尿系统', description: '前列腺恶性肿瘤', examItems: ['前列腺MR', '前列腺穿刺活检', 'PET-CT'] },
  { code: 'S37.000', name: '肾脏损伤', category: '泌尿系统', description: '肾脏损伤', examItems: ['腹部CT平扫', '腹部CT增强', '腹部MRI平扫'] },
  { code: 'N39.000', name: '尿路感染', category: '泌尿系统', description: '未特指的尿路感染', examItems: ['腹部CT平扫', '腹部彩超'] },

  // ========== 肿瘤相关 ==========
  { code: 'C73.000', name: '甲状腺癌', category: '肿瘤相关', description: '甲状腺恶性肿瘤', examItems: ['甲状腺彩超', '甲状腺CT增强', '甲状腺MR', 'PET-CT'] },
  { code: 'C50.900', name: '乳腺癌', category: '肿瘤相关', description: '未特指部位的乳房恶性肿瘤', examItems: ['乳腺钼靶', '乳腺彩超', '乳腺MRI增强', 'PET-CT'] },
  { code: 'C34.100', name: '肺癌', category: '肿瘤相关', description: '上叶肺恶性肿瘤', examItems: ['胸部CT平扫', '胸部CT增强', 'PET-CT', '肺穿刺活检'] },
  { code: 'C71.000', name: '脑肿瘤', category: '肿瘤相关', description: '大脑恶性肿瘤', examItems: ['头颅MRI平扫', '头颅MRI增强', '头颅CT平扫'] },
  { code: 'C43.900', name: '黑色素瘤', category: '肿瘤相关', description: '未特指的黑色素瘤', examItems: ['PET-CT', '区域淋巴结彩超'] },
  { code: 'C18.700', name: '乙状结肠癌', category: '肿瘤相关', description: '乙状结肠恶性肿瘤', examItems: ['腹部CT增强', '肠镜', 'PET-CT'] },
  { code: 'C53.900', name: '宫颈癌', category: '肿瘤相关', description: '宫颈恶性肿瘤', examItems: ['盆腔MRI平扫', '盆腔CT增强', 'PET-CT'] },
  { code: 'C56.000', name: '卵巢癌', category: '肿瘤相关', description: '卵巢恶性肿瘤', examItems: ['盆腔CT增强', '盆腔MRI平扫', 'PET-CT'] },
  { code: 'C62.900', name: '睾丸癌', category: '肿瘤相关', description: '未特指的睾丸恶性肿瘤', examItems: ['阴囊彩超', '腹部CT增强', 'PET-CT'] },
  { code: 'D46.900', name: '骨髓增生异常综合征', category: '肿瘤相关', description: '骨髓增生异常综合征', examItems: ['骨扫描', '脊柱MRI平扫'] },

  // ========== 先天畸形 ==========
  { code: 'Q28.300', name: '脑动静脉畸形', category: '先天畸形', description: '其他颅内血管畸形', examItems: ['头颅CTA', '脑血管DSA', '头颅MRA'] },
  { code: 'Q25.000', name: '主动脉导管未闭', category: '先天畸形', description: '动脉导管未闭', examItems: ['心脏彩超', '心脏CTA', '心电图'] },
  { code: 'Q21.000', name: '室间隔缺损', category: '先天畸形', description: '室间隔缺损', examItems: ['心脏彩超', '心脏MRI', '心电图'] },
  { code: 'Q24.000', name: '法洛四联症', category: '先天畸形', description: '法洛四联症', examItems: ['心脏彩超', '心脏CTA', '心脏MRI'] },
  { code: 'Q67.000', name: '先天性脊柱侧凸', category: '先天畸形', description: '先天性脊柱侧凸', examItems: ['脊柱全长DR', '脊柱MRI', '脊柱CT'] },
  { code: 'Q79.000', name: '先天性膈疝', category: '先天畸形', description: '先天性膈疝', examItems: ['胸部CT平扫', '胸部DR正侧位'] },

  // ========== 外伤 ==========
  { code: 'S06.800', name: '颅脑外伤', category: '外伤', description: '未特指的颅内损伤', examItems: ['头颅CT平扫', '头颅MRI平扫'] },
  { code: 'S82.100', name: '胫骨平台骨折', category: '外伤', description: '胫骨上端骨折', examItems: ['膝关节DR', '膝关节CT', '膝关节MRI'] },
  { code: 'S72.100', name: '股骨干骨折', category: '外伤', description: '股骨干骨折', examItems: ['股骨DR', '股骨CT'] },
  { code: 'S81.000', name: '膝关节损伤', category: '外伤', description: '膝关节开放性损伤', examItems: ['膝关节DR', '膝关节MRI', '膝关节CT'] },
  { code: 'S22.400', name: '连枷胸', category: '外伤', description: '肋骨骨折伴连枷胸', examItems: ['胸部DR正侧位', '胸部CT平扫'] },
  { code: 'S27.000', name: '创伤性气胸', category: '外伤', description: '创伤性气胸', examItems: ['胸部DR正侧位', '胸部CT平扫'] },
  { code: 'S37.100', name: '膀胱损伤', category: '外伤', description: '膀胱损伤', examItems: ['盆腔CT平扫', '盆腔CT增强'] },
  { code: 'S39.000', name: '腹部外伤', category: '外伤', description: '腹部及盆腔损伤', examItems: ['腹部CT平扫', '腹部CT增强'] },

  // ========== 内分泌系统 ==========
  { code: 'E10.900', name: '1型糖尿病', category: '内分泌系统', description: '未特指的1型糖尿病', examItems: ['腹部CT平扫', '胰腺MR', '眼底检查'] },
  { code: 'E11.900', name: '2型糖尿病', category: '内分泌系统', description: '未特指的2型糖尿病', examItems: ['腹部CT平扫', '腹部彩超'] },
  { code: 'E05.900', name: '甲状腺功能亢进', category: '内分泌系统', description: '未特指的甲状腺毒症', examItems: ['甲状腺彩超', '甲状腺功能检测', '甲状腺摄碘率'] },
  { code: 'E04.900', name: '甲状腺结节', category: '内分泌系统', description: '未特指的甲状腺肿', examItems: ['甲状腺彩超', '甲状腺CT增强', '甲状腺细针穿刺'] },
  { code: 'E21.000', name: '原发性甲状旁腺功能亢进', category: '内分泌系统', description: '原发性甲状旁腺功能亢进', examItems: ['颈部CT增强', '甲状腺彩超', '甲状旁腺显像'] },
  { code: 'E27.100', name: '肾上腺皮质功能减退', category: '内分泌系统', description: '肾上腺皮质功能减退', examItems: ['肾上腺CT平扫', '肾上腺MRI平扫'] },

  // ========== 血液系统 ==========
  { code: 'D69.600', name: '血小板减少症', category: '血液系统', description: '未特指的血小板减少', examItems: ['脾脏彩超', '骨髓活检'] },
  { code: 'D50.900', name: '缺铁性贫血', category: '血液系统', description: '未特指的缺铁性贫血', examItems: ['胃镜', '肠镜', '腹部CT平扫'] },
  { code: 'C91.000', name: '急性淋巴细胞白血病', category: '血液系统', description: '急性淋巴细胞白血病', examItems: ['骨扫描', '全身PET-CT', '骨髓活检'] },
  { code: 'C92.000', name: '急性髓系白血病', category: '血液系统', description: '急性髓系白血病', examItems: ['骨扫描', '全身PET-CT', '骨髓活检'] },

  // ========== 皮肤系统 ==========
  { code: 'C43.900', name: '皮肤黑色素瘤', category: '皮肤系统', description: '未特指部位的皮肤黑色素瘤', examItems: ['区域皮肤彩超', '区域淋巴结彩超', 'PET-CT'] },
  { code: 'C44.900', name: '皮肤癌', category: '皮肤系统', description: '未特指部位的皮肤恶性肿瘤', examItems: ['区域彩超', 'PET-CT'] },
  { code: 'L40.900', name: '银屑病', category: '皮肤系统', description: '未特指的银屑病', examItems: ['关节DR', '关节MRI'] },

  // ========== 精神障碍 ==========
  { code: 'F32.900', name: '抑郁症', category: '精神障碍', description: '未特指的抑郁发作', examItems: ['头颅MRI平扫', '脑功能成像'] },
  { code: 'F20.900', name: '精神分裂症', category: '精神障碍', description: '未特指的精神分裂症', examItems: ['头颅MRI平扫'] },

  // ========== 感染性疾病 ==========
  { code: 'A15.000', name: '肺结核', category: '感染性疾病', description: '原发性肺结核', examItems: ['胸部CT平扫', '胸部DR正侧位'] },
  { code: 'A17.000', name: '结核性脑膜炎', category: '感染性疾病', description: '结核性脑膜炎', examItems: ['头颅CT平扫', '头颅MRI平扫', '脑脊液检查'] },
  { code: 'B18.200', name: '慢性乙型肝炎', category: '感染性疾病', description: '慢性乙型肝炎', examItems: ['腹部彩超', '腹部CT平扫', '肝脏弹性成像'] },
  { code: 'U07.100', name: '新冠病毒病', category: '感染性疾病', description: 'COVID-19', examItems: ['胸部CT平扫', '胸部CT增强'] },

  // ========== 影像相关检查 ==========
  { code: 'R91.000', name: '肺部阴影', category: '影像相关检查', description: '肺部阴影（影像学发现）', examItems: ['胸部CT平扫', '胸部CT增强', 'PET-CT'] },
  { code: 'R93.000', name: '颅内异常阴影', category: '影像相关检查', description: '颅内异常阴影', examItems: ['头颅CT平扫', '头颅MRI平扫'] },
  { code: 'R93.200', name: '肝内异常阴影', category: '影像相关检查', description: '肝内异常阴影', examItems: ['腹部CT平扫', '腹部CT增强', '腹部MRI平扫'] },
  { code: 'R93.800', name: '其他特指部位的异常阴影', category: '影像相关检查', description: '其他特指部位的异常阴影', examItems: ['相应部位CT/MR'] },
]

// ==================== 分类定义 ====================
const CATEGORIES = [
  { id: '神经系统', label: '神经系统', icon: <Brain size={16} /> },
  { id: '呼吸系统', label: '呼吸系统', icon: <Lungs size={16} /> },
  { id: '消化系统', label: '消化系统', icon: <Activity size={16} /> },
  { id: '心血管系统', label: '心血管系统', icon: <Heart size={16} /> },
  { id: '骨骼系统', label: '骨骼系统', icon: <Bone size={16} /> },
  { id: '泌尿系统', label: '泌尿系统', icon: <Kidney size={16} /> },
  { id: '肿瘤相关', label: '肿瘤相关', icon: <Scan size={16} /> },
  { id: '先天畸形', label: '先天畸形', icon: <GitFork size={16} /> },
  { id: '外伤', label: '外伤', icon: <Zap size={16} /> },
  { id: '内分泌系统', label: '内分泌系统', icon: <TestTube size={16} /> },
  { id: '血液系统', label: '血液系统', icon: <Droplets size={16} /> },
  { id: '皮肤系统', label: '皮肤系统', icon: <StickyNote size={16} /> },
  { id: '精神障碍', label: '精神障碍', icon: <Brain size={16} /> },
  { id: '感染性疾病', label: '感染性疾病', icon: <Microscope size={16} /> },
  { id: '影像相关检查', label: '影像相关检查', icon: <ScanLine size={16} /> },
]

// ==================== 样式定义 ====================
const s = {
  blue50: '#f0f9ff',
  blue100: '#dbeafe',
  blue200: '#bfdbfe',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue800: '#1e40af',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  white: '#ffffff',
  green500: '#22c55e',
  green100: '#dcfce7',
  yellow500: '#eab308',
  yellow100: '#fef9c3',
  red500: '#ef4444',
  red100: '#fee2e2',
}

// ==================== 主组件 ====================
interface Props {
  onSelectCode?: (code: string) => void
}

export function ICDCodingAssistant({ onSelectCode }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('神经系统')
  const [selectedCode, setSelectedCode] = useState<typeof ICD10_CODES[0] | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // 过滤后的代码列表
  const filteredCodes = useMemo(() => {
    let codes = ICD10_CODES
    if (activeCategory !== '全部') {
      codes = codes.filter(c => c.category === activeCategory)
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      codes = codes.filter(c =>
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
      )
    }
    return codes
  }, [searchTerm, activeCategory])

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {}
    ICD10_CODES.forEach(c => {
      stats[c.category] = (stats[c.category] || 0) + 1
    })
    return stats
  }, [])

  const handleCodeClick = (code: typeof ICD10_CODES[0]) => {
    setSelectedCode(code)
    setShowDetailModal(true)
    if (onSelectCode) {
      onSelectCode(code.code)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: s.gray50 }}>
      {/* 顶部搜索区域 */}
      <div style={{
        background: `linear-gradient(135deg, ${s.blue800} 0%, ${s.blue600} 100%)`,
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Cpu size={20} style={{ color: s.white }} />
          <span style={{ fontSize: 16, fontWeight: 600, color: s.white }}>ICD-10计算机辅助编码</span>
          <span style={{ fontSize: 12, color: s.blue200, marginLeft: 'auto' }}>共 {ICD10_CODES.length} 条诊断编码</span>
        </div>
        {/* 搜索框 */}
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: s.gray400 }} />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="搜索诊断名称、ICD编码..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: 6,
              border: 'none',
              fontSize: 13,
              background: s.white,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* 主内容区 */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* 左侧分类导航 */}
        <div style={{
          width: 200,
          background: s.white,
          borderRight: `1px solid ${s.gray200}`,
          overflow: 'auto'
        }}>
          <div
            onClick={() => setActiveCategory('全部')}
            style={{
              padding: '10px 16px',
              fontSize: 12,
              fontWeight: 600,
              color: activeCategory === '全部' ? s.blue600 : s.gray700,
              background: activeCategory === '全部' ? s.blue50 : 'transparent',
              borderBottom: `1px solid ${s.gray100}`,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>全部分类</span>
            <span style={{ fontSize: 11, color: s.gray400 }}>{ICD10_CODES.length}</span>
          </div>
          {CATEGORIES.map(cat => (
            <div
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '10px 16px',
                fontSize: 12,
                color: activeCategory === cat.id ? s.blue600 : s.gray700,
                background: activeCategory === cat.id ? s.blue50 : 'transparent',
                borderBottom: `1px solid ${s.gray100}`,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.background = s.gray50
                }
              }}
              onMouseLeave={e => {
                if (activeCategory !== cat.id) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: activeCategory === cat.id ? s.blue500 : s.gray400 }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </div>
              <span style={{ fontSize: 11, color: s.gray400 }}>{categoryStats[cat.id] || 0}</span>
            </div>
          ))}
        </div>

        {/* 右侧代码列表 */}
        <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
          <div style={{ fontSize: 12, color: s.gray500, marginBottom: 12 }}>
            {activeCategory === '全部' ? '全部分类' : activeCategory} - 共 {filteredCodes.length} 条
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
            {filteredCodes.map(code => (
              <div
                key={code.code}
                onClick={() => handleCodeClick(code)}
                style={{
                  padding: 12,
                  background: s.white,
                  borderRadius: 8,
                  border: `1px solid ${s.gray200}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = s.blue500
                  e.currentTarget.style.boxShadow = `0 2px 8px ${s.blue100}`
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = s.gray200
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: s.white,
                    background: s.blue600,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontFamily: 'monospace'
                  }}>{code.code}</span>
                  <span style={{ fontSize: 10, color: s.gray400 }}>{code.category}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, color: s.gray800, marginBottom: 4 }}>{code.name}</div>
                <div style={{ fontSize: 11, color: s.gray500, lineHeight: 1.4 }}>{code.description}</div>
                <div style={{ marginTop: 8, fontSize: 10, color: s.blue500 }}>
                  适用检查: {code.examItems.slice(0, 2).join('、')}
                  {code.examItems.length > 2 && ' 等'}
                </div>
              </div>
            ))}
          </div>
          {filteredCodes.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: s.gray400,
              fontSize: 14
            }}>
              <Search size={32} style={{ marginBottom: 12, opacity: 0.5 }} />
              <div>未找到匹配的诊断编码</div>
            </div>
          )}
        </div>
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && selectedCode && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: s.white,
              borderRadius: 12,
              padding: 24,
              width: 480,
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: s.gray800 }}>诊断编码详情</span>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: s.gray400,
                  padding: 4
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{
              background: `linear-gradient(135deg, ${s.blue800} 0%, ${s.blue600} 100%)`,
              borderRadius: 8,
              padding: 16,
              marginBottom: 16
            }}>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: s.white,
                fontFamily: 'monospace',
                marginBottom: 8
              }}>{selectedCode.code}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: s.white }}>{selectedCode.name}</div>
              <div style={{ fontSize: 12, color: s.blue200, marginTop: 4 }}>{selectedCode.category}分类</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.gray700, marginBottom: 6 }}>诊断说明</div>
              <div style={{ fontSize: 13, color: s.gray600 }}>{selectedCode.description}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: s.gray700, marginBottom: 8 }}>适用检查项目</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedCode.examItems.map(item => (
                  <span
                    key={item}
                    style={{
                      fontSize: 11,
                      color: s.blue700,
                      background: s.blue50,
                      border: `1px solid ${s.blue200}`,
                      padding: '4px 10px',
                      borderRadius: 20
                    }}
                  >{item}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => {
                if (onSelectCode) {
                  onSelectCode(selectedCode.code)
                }
                setShowDetailModal(false)
              }}
              style={{
                width: '100%',
                marginTop: 16,
                padding: '10px 16px',
                background: s.blue600,
                color: s.white,
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              <Check size={16} />
              插入到此编码
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ICDCodingAssistant