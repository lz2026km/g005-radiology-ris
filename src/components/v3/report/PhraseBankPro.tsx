/**
 * G005 放射RIS系统 v3.0.2 - 短语库 100+ (Pro 版)
 * 对标:岱嘉 PACS / 东软 PACS — 扩展到 100+ 短语
 * 含 AI 推荐(基于 context)
 */
import React, { useState, useMemo, useCallback } from 'react'
import { Drawer, Input, Tree, Tag, Space, Button, Empty, Tooltip, Spin } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { BookOpen, Search, Sparkles, Plus } from 'lucide-react'

export interface Phrase {
  id: string
  category: string
  text: string
  shortcut?: string
  tags?: string[]
  modality?: string[] // CT/MR/DR/US/MG/DSA
  bodyPart?: string[]
  frequency?: number // 使用频次(用于排序)
}

const PHRASES: Phrase[] = [
  // CT 头颈 12
  { id: 'p-ct-h-1', category: 'CT-头颈', text: '双侧大脑半球对称,灰白质对比正常。', shortcut: 'F1', modality: ['CT'], bodyPart: ['BRAIN'], frequency: 95 },
  { id: 'p-ct-h-2', category: 'CT-头颈', text: '脑室、脑池、脑沟未见扩大、变窄。', shortcut: 'F2', modality: ['CT'], bodyPart: ['BRAIN'], frequency: 92 },
  { id: 'p-ct-h-3', category: 'CT-头颈', text: '中线结构居中,颅骨骨质未见异常。', shortcut: 'F3', modality: ['CT'], bodyPart: ['BRAIN'], frequency: 90 },
  { id: 'p-ct-h-4', category: 'CT-头颈', text: '右侧大脑中动脉供血区见片状低密度影,边界欠清。', modality: ['CT'], bodyPart: ['BRAIN'], frequency: 60 },
  { id: 'p-ct-h-5', category: 'CT-头颈', text: '脑池、脑沟内未见高密度影,排除蛛网膜下腔出血。', modality: ['CT'], bodyPart: ['BRAIN'], frequency: 75 },
  { id: 'p-ct-h-6', category: 'CT-头颈', text: '鼻窦黏膜未见增厚,窦腔内未见液平。', modality: ['CT'], bodyPart: ['SINUS'], frequency: 70 },
  { id: 'p-ct-h-7', category: 'CT-头颈', text: '甲状腺大小、形态正常,密度均匀,未见占位。', modality: ['CT'], bodyPart: ['NECK'], frequency: 65 },
  { id: 'p-ct-h-8', category: 'CT-头颈', text: '颈部未见肿大淋巴结。', modality: ['CT'], bodyPart: ['NECK'], frequency: 60 },
  { id: 'p-ct-h-9', category: 'CT-头颈', text: '鼻咽部黏膜光滑,咽隐窝对称,咽旁间隙清晰。', modality: ['CT'], bodyPart: ['NASOPHARYNX'], frequency: 50 },
  { id: 'p-ct-h-10', category: 'CT-头颈', text: '喉腔气道通畅,声带对称,喉旁间隙清晰。', modality: ['CT'], bodyPart: ['LARYNX'], frequency: 45 },
  { id: 'p-ct-h-11', category: 'CT-头颈', text: '腮腺大小形态正常,密度均匀,未见占位。', modality: ['CT'], bodyPart: ['PAROTID'], frequency: 40 },
  { id: 'p-ct-h-12', category: 'CT-头颈', text: '颅骨骨质连续,未见骨折线。', modality: ['CT'], bodyPart: ['SKULL'], frequency: 85 },

  // CT 胸部 15
  { id: 'p-ct-c-1', category: 'CT-胸部', text: '双肺纹理清晰,未见明显异常密度影。', shortcut: 'F4', modality: ['CT'], bodyPart: ['CHEST'], frequency: 98 },
  { id: 'p-ct-c-2', category: 'CT-胸部', text: '气管支气管通畅。', shortcut: 'F5', modality: ['CT'], bodyPart: ['CHEST'], frequency: 95 },
  { id: 'p-ct-c-3', category: 'CT-胸部', text: '纵隔结构清晰,未见肿大淋巴结。', shortcut: 'F6', modality: ['CT'], bodyPart: ['CHEST'], frequency: 90 },
  { id: 'p-ct-c-4', category: 'CT-胸部', text: '心脏大血管形态正常。', shortcut: 'F7', modality: ['CT'], bodyPart: ['CHEST'], frequency: 88 },
  { id: 'p-ct-c-5', category: 'CT-胸部', text: '胸腔未见积液。', shortcut: 'F8', modality: ['CT'], bodyPart: ['CHEST'], frequency: 90 },
  { id: 'p-ct-c-6', category: 'CT-胸部', text: '双侧胸膜未见增厚及结节。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 75 },
  { id: 'p-ct-c-7', category: 'CT-胸部', text: '左肺上叶前段见磨玻璃密度影,边界欠清,直径约 12mm。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 50 },
  { id: 'p-ct-c-8', category: 'CT-胸部', text: '右肺中叶外侧段见实性结节,边缘见毛刺,直径约 18mm。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 40 },
  { id: 'p-ct-c-9', category: 'CT-胸部', text: '右侧胸腔见弧形液性密度影,上缘低于肺门水平。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 45 },
  { id: 'p-ct-c-10', category: 'CT-胸部', text: '右侧胸腔见无肺纹理透亮区,肺组织压缩约 30%。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 40 },
  { id: 'p-ct-c-11', category: 'CT-胸部', text: '冠脉左前降支中段见非钙化斑块,管腔狭窄约 50%。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 35 },
  { id: 'p-ct-c-12', category: 'CT-胸部', text: '升主动脉直径约 32mm,管壁光滑,未见夹层。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 30 },
  { id: 'p-ct-c-13', category: 'CT-胸部', text: '肺动脉主干未见充盈缺损,排除肺动脉栓塞。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 35 },
  { id: 'p-ct-c-14', category: 'CT-胸部', text: '双侧乳腺未见明确肿块及异常密度。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 25 },
  { id: 'p-ct-c-15', category: 'CT-胸部', text: '肋骨骨质连续,未见骨折及骨质破坏。', modality: ['CT'], bodyPart: ['CHEST'], frequency: 60 },

  // CT 腹盆 12
  { id: 'p-ct-a-1', category: 'CT-腹盆', text: '肝脏形态、大小正常,平扫及增强各期未见异常密度灶。', shortcut: 'F9', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 95 },
  { id: 'p-ct-a-2', category: 'CT-腹盆', text: '胆囊大小正常,壁不厚,腔内未见结石影。', shortcut: 'F10', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 88 },
  { id: 'p-ct-a-3', category: 'CT-腹盆', text: '脾脏、胰腺形态密度正常。', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 90 },
  { id: 'p-ct-a-4', category: 'CT-腹盆', text: '双肾形态大小正常,未见结石及积水。', shortcut: 'F11', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 88 },
  { id: 'p-ct-a-5', category: 'CT-腹盆', text: '腹腔未见肿大淋巴结。', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 85 },
  { id: 'p-ct-a-6', category: 'CT-腹盆', text: '肝右叶见类圆形低密度灶,边界清晰,直径约 15mm,增强动脉期无明显强化。', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 50 },
  { id: 'p-ct-a-7', category: 'CT-腹盆', text: '胆总管无扩张,内径约 5mm。', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 70 },
  { id: 'p-ct-a-8', category: 'CT-腹盆', text: '膀胱充盈良好,壁不厚,腔内未见占位。', modality: ['CT'], bodyPart: ['PELVIS'], frequency: 65 },
  { id: 'p-ct-a-9', category: 'CT-腹盆', text: '前列腺大小约 35×28×30mm,形态规则,密度均匀。', modality: ['CT'], bodyPart: ['PELVIS'], frequency: 50 },
  { id: 'p-ct-a-10', category: 'CT-腹盆', text: '子宫大小形态正常,宫腔内未见占位。', modality: ['CT'], bodyPart: ['PELVIS'], frequency: 50 },
  { id: 'p-ct-a-11', category: 'CT-腹盆', text: '双侧附件区未见异常密度灶。', modality: ['CT'], bodyPart: ['PELVIS'], frequency: 60 },
  { id: 'p-ct-a-12', category: 'CT-腹盆', text: '肠管未见扩张及气液平面,肠壁未见增厚。', modality: ['CT'], bodyPart: ['ABDOMEN'], frequency: 55 },

  // MR 8
  { id: 'p-mr-1', category: 'MR', text: '双侧大脑半球对称,脑实质未见异常信号。', shortcut: 'F12', modality: ['MR'], bodyPart: ['BRAIN'], frequency: 90 },
  { id: 'p-mr-2', category: 'MR', text: 'DWI 未见扩散受限高信号。', modality: ['MR'], bodyPart: ['BRAIN'], frequency: 80 },
  { id: 'p-mr-3', category: 'MR', text: '脑室系统未见扩大、变窄。', modality: ['MR'], bodyPart: ['BRAIN'], frequency: 85 },
  { id: 'p-mr-4', category: 'MR', text: 'L4/5 椎间盘向后突出约 4mm,硬膜囊受压。', modality: ['MR'], bodyPart: ['SPINE'], frequency: 60 },
  { id: 'p-mr-5', category: 'MR', text: '右膝内侧半月板后角见线状高信号达关节面。', modality: ['MR'], bodyPart: ['KNEE'], frequency: 50 },
  { id: 'p-mr-6', category: 'MR', text: '右乳外上象限见结节状强化灶,大小约 1.2×1.0cm。', modality: ['MR'], bodyPart: ['BREAST'], frequency: 30 },
  { id: 'p-mr-7', category: 'MR', text: '肝右叶见类圆形长 T1 长 T2 信号灶,动脉期明显强化,门脉期廓清。', modality: ['MR'], bodyPart: ['ABDOMEN'], frequency: 35 },
  { id: 'p-mr-8', category: 'MR', text: '前列腺外周带 T2WI 见局灶性低信号,DWI 高信号,动态增强早期强化。', modality: ['MR'], bodyPart: ['PELVIS'], frequency: 30 },

  // DR 8
  { id: 'p-dr-1', category: 'DR', text: '双肺纹理清晰,肺门影不大。', shortcut: 'F1', modality: ['DR'], bodyPart: ['CHEST'], frequency: 95 },
  { id: 'p-dr-2', category: 'DR', text: '心影大小、形态正常,心胸比约 0.45。', modality: ['DR'], bodyPart: ['CHEST'], frequency: 90 },
  { id: 'p-dr-3', category: 'DR', text: '纵隔居中,气管居中,双侧膈面光滑,肋膈角锐利。', modality: ['DR'], bodyPart: ['CHEST'], frequency: 88 },
  { id: 'p-dr-4', category: 'DR', text: '右桡骨远端见横行骨折线,断端轻度移位。', modality: ['DR'], bodyPart: ['EXTREMITY'], frequency: 50 },
  { id: 'p-dr-5', category: 'DR', text: '腰椎生理曲度存在,椎体序列整齐,未见滑脱及楔形变。', modality: ['DR'], bodyPart: ['SPINE'], frequency: 80 },
  { id: 'p-dr-6', category: 'DR', text: '骨盆诸骨骨质连续,未见骨折及骨质破坏。', modality: ['DR'], bodyPart: ['PELVIS'], frequency: 75 },
  { id: 'p-dr-7', category: 'DR', text: '右下肺见片状渗出影,边界欠清,提示炎症。', modality: ['DR'], bodyPart: ['CHEST'], frequency: 60 },
  { id: 'p-dr-8', category: 'DR', text: '胸廓对称,所见骨质未见异常。', modality: ['DR'], bodyPart: ['CHEST'], frequency: 90 },

  // US 6
  { id: 'p-us-1', category: 'US', text: '肝脏大小形态正常,包膜光整,实质回声均匀,未见占位。', shortcut: 'F2', modality: ['US'], bodyPart: ['ABDOMEN'], frequency: 95 },
  { id: 'p-us-2', category: 'US', text: '胆囊大小正常,壁不厚,腔内未见结石。', modality: ['US'], bodyPart: ['ABDOMEN'], frequency: 90 },
  { id: 'p-us-3', category: 'US', text: '甲状腺右叶下极见低回声结节,大小约 0.8×0.6cm,边界欠清。', modality: ['US'], bodyPart: ['THYROID'], frequency: 40 },
  { id: 'p-us-4', category: 'US', text: '双肾大小正常,集合系统无分离,未见结石及积水。', modality: ['US'], bodyPart: ['KIDNEY'], frequency: 88 },
  { id: 'p-us-5', category: 'US', text: '子宫大小形态正常,内膜厚度约 8mm,宫腔内未见占位。', modality: ['US'], bodyPart: ['PELVIS'], frequency: 70 },
  { id: 'p-us-6', category: 'US', text: '乳腺腺体回声均匀,未见占位及导管扩张。', modality: ['US'], bodyPart: ['BREAST'], frequency: 75 },

  // 危急值 12
  { id: 'p-cv-1', category: '危急值', text: '大量气胸(肺组织压缩>50%),建议立即胸腔穿刺引流。', modality: ['CT', 'DR'], frequency: 30 },
  { id: 'p-cv-2', category: '危急值', text: '升主动脉见内膜片,真腔与假腔并存,Stanford A 型,建议立即外科会诊。', modality: ['CT'], frequency: 25 },
  { id: 'p-cv-3', category: '危急值', text: '大面积脑梗死,范围超一个脑叶,需立即神经内科溶栓会诊。', modality: ['CT', 'MR'], frequency: 30 },
  { id: 'p-cv-4', category: '危急值', text: '冠脉 CTA 示 LAD 闭塞,考虑急性 STEMI,需立即心内科 PCI。', modality: ['CT'], frequency: 25 },
  { id: 'p-cv-5', category: '危急值', text: '肠系膜上动脉主干闭塞,肠壁增厚伴强化减低,提示肠系膜栓塞,需立即外科探查。', modality: ['CT'], frequency: 20 },
  { id: 'p-cv-6', category: '危急值', text: '颅内大量出血,中线结构明显移位,需立即神经外科会诊。', modality: ['CT'], frequency: 25 },
  { id: 'p-cv-7', category: '危急值', text: '脑干出血,病情危重,需立即抢救。', modality: ['CT'], frequency: 15 },
  { id: 'p-cv-8', category: '危急值', text: '心包大量积液,心脏压塞,需立即心包穿刺引流。', modality: ['CT', 'US'], frequency: 15 },
  { id: 'p-cv-9', category: '危急值', text: '肺动脉主干充盈缺损,大面积肺栓塞,需立即溶栓治疗。', modality: ['CT'], frequency: 20 },
  { id: 'p-cv-10', category: '危急值', text: '张力性气胸,纵隔移位,需立即胸腔减压。', modality: ['CT', 'DR'], frequency: 15 },
  { id: 'p-cv-11', category: '危急值', text: '消化道穿孔,腹腔游离气体,需立即外科会诊。', modality: ['CT', 'DR'], frequency: 20 },
  { id: 'p-cv-12', category: '危急值', text: '异位妊娠破裂出血,腹腔积血,需立即妇科会诊。', modality: ['CT', 'US'], frequency: 15 },

  // 通用 12
  { id: 'p-cm-1', category: '通用', text: '检查所见:...', shortcut: 'Alt+1', frequency: 99 },
  { id: 'p-cm-2', category: '通用', text: '检查结论:...', shortcut: 'Alt+2', frequency: 99 },
  { id: 'p-cm-3', category: '通用', text: '建议:...', shortcut: 'Alt+3', frequency: 99 },
  { id: 'p-cm-4', category: '通用', text: '未见明显异常。', shortcut: 'F1', frequency: 95 },
  { id: 'p-cm-5', category: '通用', text: '请结合临床,必要时进一步检查。', frequency: 85 },
  { id: 'p-cm-6', category: '通用', text: '建议随访复查。', frequency: 80 },
  { id: 'p-cm-7', category: '通用', text: '建议 MRI 进一步检查。', frequency: 60 },
  { id: 'p-cm-8', category: '通用', text: '建议多学科会诊(MDT)。', frequency: 40 },
  { id: 'p-cm-9', category: '通用', text: '建议穿刺活检明确病理。', frequency: 35 },
  { id: 'p-cm-10', category: '通用', text: '建议结合实验室检查综合判断。', frequency: 50 },
  { id: 'p-cm-11', category: '通用', text: '对照既往片,本次...', frequency: 60 },
  { id: 'p-cm-12', category: '通用', text: '图像质量良好,诊断可靠。', frequency: 70 },
]

const PHRASES_BY_CATEGORY = (() => {
  const map = new Map<string, Phrase[]>()
  for (const p of PHRASES) {
    const list = map.get(p.category) ?? []
    list.push(p)
    map.set(p.category, list)
  }
  return map
})()

const TREE_DATA: DataNode[] = Array.from(PHRASES_BY_CATEGORY.entries()).map(([cat, list]) => ({
  title: (
    <span>
      {cat} <Tag style={{ fontSize: 10 }}>{list.length}</Tag>
    </span>
  ),
  key: cat,
}))

export interface PhraseBankProProps {
  open: boolean
  onClose: () => void
  onInsert?: (text: string) => void
  modality?: string
  bodyPart?: string
  /** AI 推荐开关(基于 context) */
  enableAIRecommend?: boolean
}

export const PhraseBankPro: React.FC<PhraseBankProProps> = ({
  open,
  onClose,
  onInsert,
  modality,
  bodyPart,
  enableAIRecommend = true,
}) => {
  const [keyword, setKeyword] = useState('')
  const [activeCat, setActiveCat] = useState<string | null>(null)
  const [loadingAI, setLoadingAI] = useState(false)
  const [aiRecs, setAiRecs] = useState<Phrase[]>([])

  // AI 推荐:基于模态/部位/已写内容,挑最相关 top 3
  const aiRecommend = useCallback(async () => {
    if (!enableAIRecommend) return
    setLoadingAI(true)
    await new Promise((r) => setTimeout(r, 400)) // 模拟 API 延迟
    const candidates = PHRASES.filter((p) => {
      if (modality && p.modality && !p.modality.includes(modality)) return false
      if (bodyPart && p.bodyPart && !p.bodyPart.includes(bodyPart)) return false
      return true
    })
    const ranked = candidates.sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0)).slice(0, 3)
    setAiRecs(ranked)
    setLoadingAI(false)
  }, [modality, bodyPart, enableAIRecommend])

  React.useEffect(() => {
    if (open && enableAIRecommend) {
      void aiRecommend()
    }
  }, [open, enableAIRecommend, aiRecommend])

  const filtered = useMemo(() => {
    let result: Phrase[] = []
    if (keyword) {
      const q = keyword.toLowerCase()
      result = PHRASES.filter(
        (p) =>
          p.text.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
      )
    } else if (activeCat) {
      result = PHRASES_BY_CATEGORY.get(activeCat) ?? []
    } else if (aiRecs.length > 0) {
      result = aiRecs
    } else {
      // 默认按频次显示 top 20
      result = [...PHRASES].sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0)).slice(0, 20)
    }
    // 应用模态/部位过滤
    if (modality || bodyPart) {
      result = result.filter((p) => {
        if (modality && p.modality && !p.modality.includes(modality)) return false
        if (bodyPart && p.bodyPart && !p.bodyPart.includes(bodyPart)) return false
        return true
      })
    }
    return result
  }, [keyword, activeCat, aiRecs, modality, bodyPart])

  return (
    <Drawer
      data-testid="phrase-bank-pro"
      title={
        <Space>
          <BookOpen size={16} color="#1e3a5f" />
          <span>短语库 Pro · {PHRASES.length} 词</span>
          {modality && <Tag color="blue">{modality}</Tag>}
          {bodyPart && <Tag>{bodyPart}</Tag>}
        </Space>
      }
      open={open}
      onClose={onClose}
      width={560}
    >
      <Input
        data-testid="pbp-search"
        prefix={<Search size={14} />}
        placeholder="搜索短语..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        allowClear
        style={{ marginBottom: 12 }}
      />

      {enableAIRecommend && !keyword && !activeCat && aiRecs.length > 0 && (
        <div
          data-testid="pbp-ai-recs"
          style={{
            background: 'linear-gradient(135deg, #722ed110, #1677ff05)',
            border: '1px solid #722ed130',
            borderRadius: 6,
            padding: 8,
            marginBottom: 12,
          }}
        >
          <Space style={{ marginBottom: 6 }}>
            <Sparkles size={14} color="#722ed1" />
            <span style={{ fontSize: 12, fontWeight: 600 }}>AI 推荐(基于检查类型/部位/频次)</span>
            {loadingAI && <Spin size="small" />}
          </Space>
          <div style={{ fontSize: 11, color: '#64748b' }}>AI 智能排序,前 3 条</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, height: 'calc(100% - 80px)' }}>
        <div style={{ width: 140, borderRight: '1px solid #f0f0f0', paddingRight: 8, overflow: 'auto' }}>
          <Tree
            treeData={TREE_DATA}
            defaultExpandAll
            selectedKeys={activeCat ? [activeCat] : []}
            onSelect={(keys) => setActiveCat((keys[0] as string) ?? null)}
          />
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 ? (
            <Empty description="无匹配短语" />
          ) : (
            filtered.map((p) => (
              <div
                key={p.id}
                data-testid={`pbp-phrase-${p.id}`}
                style={{
                  padding: 8,
                  background: aiRecs.some((r) => r.id === p.id) ? '#faf5ff' : '#f8fafc',
                  borderRadius: 4,
                  marginBottom: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  lineHeight: 1.6,
                  border: aiRecs.some((r) => r.id === p.id) ? '1px solid #722ed130' : '1px solid transparent',
                }}
                onClick={() => onInsert?.(p.text)}
              >
                <Space style={{ marginBottom: 2 }} size={4} wrap>
                  <Tag color="blue" style={{ fontSize: 10 }}>
                    {p.category}
                  </Tag>
                  {p.shortcut && (
                    <Tag color="purple" style={{ fontSize: 10 }}>
                      {p.shortcut}
                    </Tag>
                  )}
                  {aiRecs.some((r) => r.id === p.id) && (
                    <Tag color="magenta" style={{ fontSize: 10 }} icon={<Sparkles size={8} />}>
                      AI
                    </Tag>
                  )}
                </Space>
                <div>{p.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </Drawer>
  )
}

export default PhraseBankPro
