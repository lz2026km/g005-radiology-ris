/**
 * G005 放射RIS系统 v3.0.2 - 报告编辑器内嵌 ICD-10 + RadLex 检索
 * 对标:飞利浦 IntelliSpace / 西门子 IKM 报告编辑器内联医学编码检索
 *
 * 功能:
 *  - 弹层检索 ICD-10 / RadLex
 *  - 一键插入到报告指定位置
 *  - 关键词联想
 *  - 树形浏览(章/节)
 */
import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Input, List, Tabs, Tag, Empty } from 'antd'
import { Search, Stethoscope, Atom } from 'lucide-react'

// ICD-10 简化词典(真实生产应后端接口)
const ICD10_DATA: { code: string; name: string; category: string }[] = [
  { code: 'J18.901', name: '肺炎,未特指', category: '呼吸系统' },
  { code: 'J18.000', name: '支气管肺炎,未特指', category: '呼吸系统' },
  { code: 'J44.101', name: '慢性阻塞性肺病急性加重', category: '呼吸系统' },
  { code: 'J93.000', name: '张力性气胸', category: '呼吸系统' },
  { code: 'J93.100', name: '自发性气胸', category: '呼吸系统' },
  { code: 'I26.900', name: '肺栓塞', category: '循环系统' },
  { code: 'I21.001', name: '急性 ST 段抬高型心肌梗死', category: '循环系统' },
  { code: 'I25.103', name: '冠状动脉粥样硬化性心脏病', category: '循环系统' },
  { code: 'I67.601', name: '大脑动脉非破裂性闭塞', category: '循环系统' },
  { code: 'I60.900', name: '蛛网膜下腔出血', category: '循环系统' },
  { code: 'I61.900', name: '脑内出血', category: '循环系统' },
  { code: 'I63.900', name: '脑梗死', category: '循环系统' },
  { code: 'I71.000', name: '主动脉夹层', category: '循环系统' },
  { code: 'K35.800', name: '急性阑尾炎,其他和未特指', category: '消化系统' },
  { code: 'K76.000', name: '脂肪肝', category: '消化系统' },
  { code: 'K80.200', name: '胆囊结石', category: '消化系统' },
  { code: 'K85.900', name: '急性胰腺炎', category: '消化系统' },
  { code: 'N18.900', name: '慢性肾衰竭', category: '泌尿系统' },
  { code: 'N20.000', name: '肾结石', category: '泌尿系统' },
  { code: 'C34.900', name: '肺恶性肿瘤', category: '肿瘤' },
  { code: 'C22.000', name: '肝细胞癌', category: '肿瘤' },
  { code: 'C50.900', name: '乳腺恶性肿瘤', category: '肿瘤' },
  { code: 'C61.x00', name: '前列腺恶性肿瘤', category: '肿瘤' },
  { code: 'D12.600', name: '结肠良性肿瘤', category: '肿瘤' },
  { code: 'M51.200', name: '腰椎间盘移位', category: '肌肉骨骼' },
  { code: 'M75.100', name: '肩袖综合征', category: '肌肉骨骼' },
  { code: 'M23.300', name: '膝关节半月板紊乱', category: '肌肉骨骼' },
  { code: 'S32.000', name: '腰椎骨折', category: '损伤' },
  { code: 'S42.200', name: '肱骨干骨折', category: '损伤' },
  { code: 'S52.500', name: '桡骨远端骨折', category: '损伤' },
  { code: 'S06.000', name: '颅内损伤', category: '损伤' },
]

// RadLex 简化词典
const RADLEX_DATA: { rid: string; name: string; category: string }[] = [
  { rid: 'RID11936', name: 'Liver', category: '腹部解剖' },
  { rid: 'RID1339', name: 'Pancreas', category: '腹部解剖' },
  { rid: 'RID251', name: 'Spleen', category: '腹部解剖' },
  { rid: 'RID303', name: 'Kidney', category: '腹部解剖' },
  { rid: 'RID6', name: 'Lung', category: '胸部解剖' },
  { rid: 'RID237', name: 'Heart', category: '胸部解剖' },
  { rid: 'RID55', name: 'Aorta', category: '胸部解剖' },
  { rid: 'RID1319', name: 'Brain', category: '神经解剖' },
  { rid: 'RID6423', name: 'Cerebellum', category: '神经解剖' },
  { rid: 'RID6303', name: 'Cerebral hemisphere', category: '神经解剖' },
  { rid: 'RID3806', name: 'Vertebral column', category: '骨骼解剖' },
  { rid: 'RID4598', name: 'Cervical vertebra', category: '骨骼解剖' },
  { rid: 'RID2502', name: 'Lumbar vertebra', category: '骨骼解剖' },
  { rid: 'RID4654', name: 'Knee joint', category: '骨骼解剖' },
  { rid: 'RID4658', name: 'Hip joint', category: '骨骼解剖' },
  { rid: 'RID1364', name: 'Breast', category: '其他' },
  { rid: 'RID2551', name: 'Prostate', category: '其他' },
  { rid: 'RID1647', name: 'Uterus', category: '其他' },
  { rid: 'RID2860', name: 'Thyroid', category: '其他' },
  { rid: 'RID5807', name: 'Pulmonary artery', category: '胸部解剖' },
]

export interface InlineTermLookupProps {
  /** 打开状态 */
  open: boolean
  onClose: () => void
  /** 插入到文本框 */
  onInsert?: (text: string) => void
  /** 位置 */
  placement?: 'top' | 'bottom'
  /** 默认 Tab */
  defaultTab?: 'icd10' | 'radlex'
}

export const InlineTermLookup: React.FC<InlineTermLookupProps> = ({
  open,
  onClose,
  onInsert,
  defaultTab = 'icd10',
}) => {
  const [tab, setTab] = useState<'icd10' | 'radlex'>(defaultTab)
  const [keyword, setKeyword] = useState('')
  const inputRef = useRef<any>(null)

  React.useEffect(() => {
    if (open) {
      setKeyword('')
      setTab(defaultTab)
      setTimeout(() => inputRef.current?.focus?.(), 100)
    }
  }, [open, defaultTab])

  const filteredICD10 = useMemo(() => {
    if (!keyword) return ICD10_DATA
    const q = keyword.toLowerCase()
    return ICD10_DATA.filter(
      (d) => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.category.includes(q)
    )
  }, [keyword])

  const filteredRadLex = useMemo(() => {
    if (!keyword) return RADLEX_DATA
    const q = keyword.toLowerCase()
    return RADLEX_DATA.filter(
      (d) => d.rid.toLowerCase().includes(q) || d.name.toLowerCase().includes(q) || d.category.includes(q)
    )
  }, [keyword])

  const handleInsert = useCallback(
    (text: string) => {
      onInsert?.(text)
      onClose()
    },
    [onInsert, onClose]
  )

  if (!open) return null

  return (
    <div
      data-testid="inline-term-lookup"
      style={{
        position: 'absolute',
        right: 0,
        top: '100%',
        marginTop: 4,
        zIndex: 1050,
        width: 380,
        maxHeight: 480,
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
        <Input
          ref={inputRef}
          data-testid="term-search"
          prefix={<Search size={12} />}
          placeholder={tab === 'icd10' ? '搜索 ICD-10 编码或名称' : '搜索 RadLex ID 或名称'}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
        />
      </div>

      <Tabs
        size="small"
        activeKey={tab}
        onChange={(k) => setTab(k as 'icd10' | 'radlex')}
        items={[
          {
            key: 'icd10',
            label: (
              <span>
                <Stethoscope size={12} /> ICD-10
              </span>
            ),
            children: (
              <div style={{ maxHeight: 380, overflow: 'auto' }}>
                {filteredICD10.length === 0 ? (
                  <Empty description="无匹配" />
                ) : (
                  <List
                    size="small"
                    dataSource={filteredICD10}
                    renderItem={(item) => (
                      <List.Item
                        key={item.code}
                        data-testid={`term-icd10-${item.code}`}
                        style={{ cursor: 'pointer', padding: '6px 12px' }}
                        onClick={() => handleInsert(`${item.code} ${item.name}`)}
                      >
                        <List.Item.Meta
                          avatar={<Tag color="blue" style={{ fontSize: 12, fontWeight: 600 }}>{item.code}</Tag>}
                          title={<span style={{ fontSize: 13 }}>{item.name}</span>}
                          description={<Tag style={{ fontSize: 12 }}>{item.category}</Tag>}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            ),
          },
          {
            key: 'radlex',
            label: (
              <span>
                <Atom size={12} /> RadLex
              </span>
            ),
            children: (
              <div style={{ maxHeight: 380, overflow: 'auto' }}>
                {filteredRadLex.length === 0 ? (
                  <Empty description="无匹配" />
                ) : (
                  <List
                    size="small"
                    dataSource={filteredRadLex}
                    renderItem={(item) => (
                      <List.Item
                        key={item.rid}
                        data-testid={`term-radlex-${item.rid}`}
                        style={{ cursor: 'pointer', padding: '6px 12px' }}
                        onClick={() => handleInsert(`${item.rid} ${item.name}`)}
                      >
                        <List.Item.Meta
                          avatar={<Tag color="green" style={{ fontSize: 12, fontWeight: 600 }}>{item.rid}</Tag>}
                          title={<span style={{ fontSize: 13 }}>{item.name}</span>}
                          description={<Tag style={{ fontSize: 12 }}>{item.category}</Tag>}
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default InlineTermLookup
