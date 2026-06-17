/**
 * 测量标准枚举
 *
 * 支持的影像测量标准:
 * - `recist-1.1` :实体瘤疗效评估(Response Evaluation Criteria in Solid Tumors v1.1)
 * - `who`       :WHO 双径乘积标准(用于和 RECIST 1.1 对照)
 * - `volumetric`:体积测量(3D 分割,适合不规则病灶)
 * - `perfusion` :动态灌注(Time-to-Peak / Wash-in / Wash-out)
 * - `suv`       :PET 标准摄取值(Standardized Uptake Value)
 */
export type MeasurementStandard = 'recist-1.1' | 'who' | 'volumetric' | 'perfusion' | 'suv'

/**
 * 病灶测量目标
 *
 * 表示一次评估中需要测量的单个病灶,包含病灶基本信息、所在切片集合、
 * 所采用的测量标准,以及是否为 RECIST 靶病灶(决定后续治疗反应评估权重)。
 */
export interface LesionTarget {
  id: string
  label: string
  location: string
  slices: LesionSlice[]
  standard: MeasurementStandard
  isTarget: boolean
  lesionNumber: number
}

/**
 * 病灶切片测量数据
 *
 * 描述单个 DICOM 实例(instance)上的测量值,部分测量(面积/体积)可选填。
 * `longestDiameter` 是 RECIST 1.1 必需字段。
 */
export interface LesionSlice {
  instanceNumber: number
  longestDiameter: number
  perpendicularDiameter?: number
  area?: number
  volume?: number
}

/**
 * 测量结果
 *
 * 任意测量标准的统一返回结构,便于在 UI 中以表格/卡片方式统一展示。
 * `confidence` 范围 0-1,来自自动测量算法的不确定性评估。
 */
export interface MeasurementResult {
  lesionId: string
  standard: MeasurementStandard
  value: number
  unit: string
  confidence: number
  timestamp: string
}

/**
 * 时间维度对比结果(治疗反应评估)
 *
 * 对同一病灶的基线(baseline)与随访(followUp)测量值进行比较,得出 RECIST 1.1 反应类别:
 * - `CR` :Complete Response(完全缓解,病灶消失)
 * - `PR` :Partial Response(部分缓解,缩小 ≥30%)
 * - `SD` :Stable Disease(稳定,缩小 < 30% 且增大 < 20%)
 * - `PD` :Progressive Disease(进展,增大 ≥20% 或出现新病灶)
 * - `NE` :Not Evaluable(无法评估)
 */
export interface TemporalComparison {
  baseline: MeasurementResult
  followUp: MeasurementResult
  changePercent: number
  assessment: 'CR' | 'PR' | 'SD' | 'PD' | 'NE'
}

/**
 * RECIST 1.1 单径测量之和
 *
 * 按 RECIST 1.1 规范,对每个切片取最长径 + 垂直径(如存在)累加,
 * 输出以毫米(mm)为单位的单径总和,用于靶病灶治疗反应评估。
 *
 * 注意:仅累加最长径,没有垂直径的切片使用最长径单独计入。
 * @param lesion 病灶测量目标
 * @returns 测量结果(`value` = 单径总和,单位 mm)
 */
export function measureRecist11(lesion: LesionTarget): MeasurementResult {
  const sumDiameters = lesion.slices.reduce((sum, s) => {
    if (s.longestDiameter && s.perpendicularDiameter) {
      return sum + s.longestDiameter + s.perpendicularDiameter
    }
    return sum + s.longestDiameter
  }, 0)

  return {
    lesionId: lesion.id,
    standard: 'recist-1.1',
    value: sumDiameters,
    unit: 'mm',
    confidence: 0.9,
    timestamp: new Date().toISOString(),
  }
}

/**
 * WHO 双径乘积测量
 *
 * 按 WHO 标准,对每个切片计算 长径 × 垂直径 的乘积并累加,
 * 输出以平方毫米(mm²)为单位的总乘积。常用于与 RECIST 1.1 对照。
 *
 * 若切片缺少垂直径,使用最长径作为退化值(此时乘积退化为面积近似)。
 * @param lesion 病灶测量目标
 * @returns 测量结果(`value` = 双径乘积之和,单位 mm²)
 */
export function measureWho(lesion: LesionTarget): MeasurementResult {
  const products = lesion.slices.map(s => s.longestDiameter * (s.perpendicularDiameter ?? s.longestDiameter))
  const sumProduct = products.reduce((a, b) => a + b, 0)

  return {
    lesionId: lesion.id,
    standard: 'who',
    value: sumProduct,
    unit: 'mm²',
    confidence: 0.85,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 体积测量(3D 分割)
 *
 * 累加每个切片中预先分割好的体积值,适合不规则病灶或亚实性结节。
 * 缺失体积的切片按 0 计入(可能低估总体积,需在 UI 上提示)。
 * @param lesion 病灶测量目标
 * @returns 测量结果(`value` = 总体积,单位 mm³)
 */
export function measureVolumetric(lesion: LesionTarget): MeasurementResult {
  const totalVolume = lesion.slices.reduce((sum, s) => sum + (s.volume ?? 0), 0)

  return {
    lesionId: lesion.id,
    standard: 'volumetric',
    value: totalVolume,
    unit: 'mm³',
    confidence: 0.8,
    timestamp: new Date().toISOString(),
  }
}

/**
 * 时间维度对比:基线 vs 随访,得出 RECIST 1.1 反应类别
 *
 * 算法:
 * 1) 计算变化百分比 `changePercent = (followUp - baseline) / baseline * 100`
 * 2) 按 RECIST 1.1 阈值分类:
 *    - changePercent ≤ -100% → CR(完全缓解,病灶消失)
 *    - -100% < changePercent ≤ -30% → PR(部分缓解)
 *    - -30% < changePercent < +20% → SD(稳定)
 *    - changePercent ≥ +20% → PD(进展)
 * 3) 基线为 0、随访非法或变化百分比溢出 → 返回 `NE`(无法评估)
 *
 * @param baseline 基线测量结果
 * @param followUp 随访测量结果
 * @returns 包含变化百分比和反应类别的时间对比结果
 */
export function compareTemporal(
  baseline: MeasurementResult,
  followUp: MeasurementResult
): TemporalComparison {
  if (!Number.isFinite(baseline.value) || baseline.value === 0 || !Number.isFinite(followUp.value)) {
    return { baseline, followUp, changePercent: 0, assessment: 'NE' }
  }

  const changePercent = ((followUp.value - baseline.value) / baseline.value) * 100
  if (!Number.isFinite(changePercent)) {
    return { baseline, followUp, changePercent: 0, assessment: 'NE' }
  }

  let assessment: TemporalComparison['assessment'] = 'SD'
  if (changePercent <= -100) assessment = 'CR'
  else if (changePercent <= -30) assessment = 'PR'
  else if (changePercent >= 20) assessment = 'PD'

  return { baseline, followUp, changePercent, assessment }
}

/**
 * 计算 PET 标准摄取值(SUV)
 *
 * 公式:`SUV = (activityConcentration × bodyWeight) / injectedDose × 1000`
 * 单位约定:`activityConcentration` 为 kBq/ml,`injectedDose` 为 MBq,
 * `bodyWeight` 为 kg,最终 SUV 无量纲。
 *
 * 边界处理:注射剂量或体重为非正值时返回 0(避免除零)。
 *
 * @param activityConcentration 感兴趣区放射性活度浓度 (kBq/ml)
 * @param injectedDose 注射剂量 (MBq)
 * @param bodyWeight 患者体重 (kg)
 * @returns 标准摄取值 SUV(无量纲)
 */
export function calculateSuv(
  activityConcentration: number,
  injectedDose: number,
  bodyWeight: number
): number {
  if (injectedDose <= 0 || bodyWeight <= 0) return 0
  return (activityConcentration * bodyWeight) / injectedDose * 1000
}

/**
 * 计算动态灌注参数
 *
 * 输入为时间-信号强度曲线,典型来源为 DCE-MRI 或动态增强 CT 的 ROI 信号序列。
 *
 * 输出:
 * - `ttp`     :Time-to-Peak,信号强度峰值对应的时间点(秒)
 * - `washIn`  :相对基线的上升幅度百分比 = (peak - baseline) / baseline × 100
 * - `washOut` :从峰值到末帧的相对下降百分比 = (peak - last) / peak × 100
 *
 * 边界处理:基线 ≤ 0 时 washIn 取 0;峰值 ≤ 0 时 washOut 取 0;非法索引 fallback 到 0。
 *
 * @param signalIntensity 时间-信号强度序列
 * @param timePoints 对应的时间点数组
 * @param baselineIndex 基线索引(用于 washIn 计算的对照点)
 * @returns `{ ttp, washIn, washOut }` 灌注三参数
 */
export function calculatePerfusion(
  signalIntensity: number[],
  timePoints: number[],
  baselineIndex: number
): { ttp: number; washIn: number; washOut: number } {
  const baseline = signalIntensity[baselineIndex] ?? 0
  const maxIdx = signalIntensity.indexOf(Math.max(...signalIntensity))
  const ttp = timePoints[maxIdx] ?? 0
  const peak = signalIntensity[maxIdx] ?? 0

  const washIn = baseline > 0 ? ((peak - baseline) / baseline) * 100 : 0
  const washOut = peak > 0 ? ((peak - (signalIntensity[signalIntensity.length - 1] ?? peak)) / peak) * 100 : 0

  return { ttp, washIn, washOut }
}
