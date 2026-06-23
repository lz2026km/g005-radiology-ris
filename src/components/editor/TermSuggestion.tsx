// ============================================================
// G005 放射科RIS系统 v1.0.1 - 术语联想组件
// Phase R1：基于输入内容实时联想医学术语
// ============================================================

import React, { useMemo } from 'react';
import { BookOpen, X } from 'lucide-react';

export interface TermSuggestion {
  id: string;
  keyword: string;          // 输入触发词
  pinyin: string;           // 拼音首字母
  fullTerm: string;         // 完整术语
  category: string;         // 分类
  synonyms?: string[];      // 同义词
  snippet?: string;         // 插入的整段
}

const SAMPLE_TERMS: TermSuggestion[] = [
  { id: 't-001', keyword: '肺纹理', pinyin: 'fwl', fullTerm: '双肺纹理清晰', category: '胸部', snippet: '双肺纹理清晰，未见明显异常密度影。' },
  { id: 't-002', keyword: '肺纹理', pinyin: 'fwl', fullTerm: '双肺纹理增多紊乱', category: '胸部', snippet: '双肺纹理增多紊乱，提示慢性支气管炎可能。' },
  { id: 't-003', keyword: '磨玻璃', pinyin: 'mbl', fullTerm: '磨玻璃密度影', category: '胸部', snippet: '右肺上叶见磨玻璃密度结节影，边界欠清。' },
  { id: 't-004', keyword: '磨玻璃', pinyin: 'mbl', fullTerm: '混合磨玻璃结节', category: '胸部', snippet: '右肺下叶见混合磨玻璃结节影，内见实性成分。' },
  { id: 't-005', keyword: '实性', pinyin: 'shix', fullTerm: '实性结节', category: '胸部', snippet: '右肺上叶实性结节，大小约 8mm×7mm，边缘呈分叶状。' },
  { id: 't-006', keyword: '钙化', pinyin: 'gh', fullTerm: '钙化灶', category: '胸部', snippet: '右上肺见点状钙化灶，边界清晰，考虑为良性。' },
  { id: 't-007', keyword: '分叶', pinyin: 'fy', fullTerm: '分叶征', category: '胸部', snippet: '肿块边缘呈分叶状，提示恶性可能。' },
  { id: 't-008', keyword: '毛刺', pinyin: 'mc', fullTerm: '毛刺征', category: '胸部', snippet: '肿块边缘见短毛刺，提示周围型肺癌可能。' },
  { id: 't-009', keyword: '胸膜', pinyin: 'xm', fullTerm: '胸膜增厚', category: '胸部', snippet: '双侧胸膜局限性增厚，未见明显胸腔积液。' },
  { id: 't-010', keyword: '胸腔', pinyin: 'xq', fullTerm: '胸腔积液', category: '胸部', snippet: '右侧胸腔见弧形液体密度影，提示胸腔积液。' },
  { id: 't-011', keyword: '纵隔', pinyin: 'zg', fullTerm: '纵隔淋巴结', category: '胸部', snippet: '纵隔内见多发肿大淋巴结，短径约 12mm。' },
  { id: 't-012', keyword: '肝', pinyin: 'g', fullTerm: '肝脏大小正常', category: '腹部', snippet: '肝脏大小正常，包膜光滑，实质密度均匀。' },
  { id: 't-013', keyword: '肝', pinyin: 'g', fullTerm: '肝硬化', category: '腹部', snippet: '肝体积缩小，表面凹凸不平，呈结节状改变，提示肝硬化。' },
  { id: 't-014', keyword: '胆囊', pinyin: 'dn', fullTerm: '胆囊结石', category: '腹部', snippet: '胆囊内见多发强回声光团，后伴声影，可随体位改变而移动。' },
  { id: 't-015', keyword: '胆囊', pinyin: 'dn', fullTerm: '胆囊壁增厚', category: '腹部', snippet: '胆囊壁增厚，约 5mm，腔内未见结石影。' },
  { id: 't-016', keyword: '胰', pinyin: 'y', fullTerm: '胰腺饱满', category: '腹部', snippet: '胰腺饱满，密度欠均，主胰管未见明显扩张。' },
  { id: 't-017', keyword: '肾', pinyin: 's', fullTerm: '双肾结石', category: '腹部', snippet: '双肾内见多发强回声光团，后伴声影，最大约 6mm。' },
  { id: 't-018', keyword: '肾', pinyin: 's', fullTerm: '肾积水', category: '腹部', snippet: '左肾盂肾盏扩张，最宽处约 12mm，提示肾积水。' },
  { id: 't-019', keyword: '脑', pinyin: 'n', fullTerm: '脑实质未见异常', category: '头颅', snippet: '双侧大脑半球对称，脑实质未见明显异常密度影。' },
  { id: 't-020', keyword: '脑', pinyin: 'n', fullTerm: '脑梗死', category: '头颅', snippet: '左侧基底节区见片状低密度影，边界欠清，符合脑梗死表现。' },
  { id: 't-021', keyword: '出血', pinyin: 'cx', fullTerm: '硬膜下血肿', category: '头颅', snippet: '左侧额颞顶部颅骨内板下见新月形高密度影，提示硬膜下血肿。' },
  { id: 't-022', keyword: '出血', pinyin: 'cx', fullTerm: '蛛网膜下腔出血', category: '头颅', snippet: '鞍上池、外侧裂池见高密度影填充，提示蛛网膜下腔出血。' },
  { id: 't-023', keyword: '椎间盘', pinyin: 'zjp', fullTerm: '椎间盘突出', category: '脊柱', snippet: 'L4/5 椎间盘向后方突出约 5mm，压迫硬膜囊。' },
  { id: 't-024', keyword: '椎体', pinyin: 'zt', fullTerm: '椎体压缩性骨折', category: '脊柱', snippet: 'L1 椎体变扁，呈楔形改变，提示压缩性骨折。' },
  { id: 't-025', keyword: '骨折', pinyin: 'gz', fullTerm: 'Colles 骨折', category: '四肢', snippet: '右桡骨远端横行骨折线，骨折远端向背侧移位，符合 Colles 骨折。' },
  { id: 't-026', keyword: 'BI-RADS', pinyin: 'br', fullTerm: 'BI-RADS 3 类', category: '乳腺', snippet: '左乳结节，BI-RADS 3 类（可能良性），建议短期随访。' },
  { id: 't-027', keyword: '冠脉', pinyin: 'gm', fullTerm: '冠脉多支病变', category: '心脏', snippet: '左前降支中段狭窄约 70%，右冠状动脉远端狭窄约 50%。' },
  { id: 't-028', keyword: '正常', pinyin: 'zc', fullTerm: '未见明显异常', category: '通用', snippet: '检查部位未见明显异常密度/信号影。' },
  { id: 't-029', keyword: '建议', pinyin: 'jy', fullTerm: '建议随访', category: '通用', snippet: '建议 3-6 个月后复查。' },
  { id: 't-030', keyword: '建议', pinyin: 'jy', fullTerm: '建议进一步检查', category: '通用', snippet: '建议进一步 MRI 增强或穿刺活检明确诊断。' },
];

export interface TermSuggestionProps {
  query: string;
  onSelect: (term: TermSuggestion) => void;
  onClose?: () => void;
  maxResults?: number;
  position?: 'top' | 'bottom';
}

export const TermSuggestionPanel: React.FC<TermSuggestionProps> = ({
  query,
  onSelect,
  onClose,
  maxResults = 8,
  position = 'bottom',
}) => {
  const results = useMemo(() => {
    if (!query || query.length < 1) return [];
    const q = query.toLowerCase().trim();
    return SAMPLE_TERMS.filter(t =>
      t.keyword.includes(q) ||
      t.pinyin.toLowerCase().includes(q) ||
      t.fullTerm.toLowerCase().includes(q) ||
      t.category.includes(q) ||
      (t.synonyms || []).some(s => s.includes(q))
    ).slice(0, maxResults);
  }, [query, maxResults]);

  if (results.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      [position]: '100%',
      left: 0,
      right: 0,
      marginTop: position === 'bottom' ? 4 : 0,
      marginBottom: position === 'top' ? 4 : 0,
      background: '#fff',
      border: '1px solid #3b82f6',
      borderRadius: 6,
      boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
      zIndex: 100,
      maxHeight: 280,
      overflowY: 'auto',
    }}>
      <div style={{
        padding: '6px 10px',
        background: '#eff6ff',
        borderBottom: '1px solid #bfdbfe',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 12,
        color: '#1e40af',
        fontWeight: 600,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <BookOpen size={12} /> 术语联想 · {results.length} 个结果
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1e40af', padding: 0 }}
          >
            <X size={12} />
          </button>
        )}
      </div>
      {results.map(term => (
        <button
          key={term.id}
          type="button"
          onClick={() => onSelect(term)}
          style={{
            width: '100%',
            padding: '8px 10px',
            border: 'none',
            borderBottom: '1px solid #f1f5f9',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#eff6ff'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{term.fullTerm}</span>
            <span style={{
              fontSize: 12,
              padding: '0 4px',
              background: '#dbeafe',
              color: '#1e40af',
              borderRadius: 3,
            }}>{term.category}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>@{term.pinyin}</span>
          </div>
          {term.snippet && (
            <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
              {term.snippet}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default TermSuggestionPanel;
