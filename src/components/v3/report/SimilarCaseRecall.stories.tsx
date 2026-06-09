/**
 * G005 放射RIS系统 v3.0.2 - 相似病例检索 Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import SimilarCaseRecall from './SimilarCaseRecall'

const meta: Meta<typeof SimilarCaseRecall> = {
  title: 'v3/Report/SimilarCaseRecall',
  component: SimilarCaseRecall,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof SimilarCaseRecall>

const SAMPLE_CASES = [
  {
    id: 'C1', patientId: 'P1', patientName: '王五', age: 45, gender: 'M', modality: 'CT', bodyPart: 'CHEST',
    radsCategory: 'Lung-RADS 4', findings: '右肺上叶见实性结节,直径 12mm。', conclusion: '考虑周围型肺癌。',
    reportDate: '2024-06-10', author: '王医师', verified: true, tags: ['恶性', '结节'],
  },
  {
    id: 'C2', patientId: 'P2', patientName: '李四', age: 50, gender: 'F', modality: 'MR', bodyPart: 'BRAIN',
    findings: '脑白质见小缺血灶。', conclusion: '考虑腔隙性脑梗死。',
    reportDate: '2024-05-20', author: '李医师', verified: true,
  },
  {
    id: 'C3', patientId: 'P3', patientName: '张三', age: 60, gender: 'M', modality: 'CT', bodyPart: 'CHEST',
    radsCategory: 'Lung-RADS 3', findings: '右肺下叶见磨玻璃密度影,直径 8mm,边界欠清。', conclusion: '考虑炎症,建议随访。',
    reportDate: '2024-04-15', author: '张医师', verified: true,
  },
]

export const Default: Story = {
  args: {
    cases: SAMPLE_CASES,
    currentReport: {
      findings: '右肺上叶见结节,直径 10mm。',
      conclusion: '考虑周围型肺癌。',
      modality: 'CT',
      bodyPart: 'CHEST',
      radsCategory: 'Lung-RADS 4',
    },
  },
}

export const Empty: Story = {
  args: {
    cases: [],
  },
}
