/**
 * G005 放射RIS系统 v3.0.2 - KPI 大盘 Story
 */
import type { Meta, StoryObj } from '@storybook/react'
import KpiDashboard from './KpiDashboard'

const meta: Meta<typeof KpiDashboard> = {
  title: 'v3/Stats/KpiDashboard',
  component: KpiDashboard,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj<typeof KpiDashboard>

const SERIES = Array.from({ length: 30 }, (_, i) => ({
  date: `2024-06-${String(i + 1).padStart(2, '0')}`,
  exams: 50 + Math.floor(Math.random() * 20),
  reports: 45 + Math.floor(Math.random() * 15),
  critical: Math.floor(Math.random() * 3),
  averageReportMinutes: 30 + Math.floor(Math.random() * 15),
  deviceBusyHours: 6 + Math.random() * 2,
  positiveRate: 0.3 + Math.random() * 0.3,
  approvalRate: 0.85 + Math.random() * 0.1,
}))

const TOP_DOCTORS = [
  { name: '张医师', count: 280 },
  { name: '李主任', count: 230 },
  { name: '王医师', count: 180 },
  { name: '刘医师', count: 150 },
]

const MODALITY = [
  { modality: 'CT', count: 1200 },
  { modality: 'MR', count: 800 },
  { modality: 'DR', count: 2000 },
  { modality: 'US', count: 600 },
  { modality: 'MG', count: 200 },
]

export const Default: Story = {
  args: {
    series: SERIES,
    topDoctors: TOP_DOCTORS,
    modalityBreakdown: MODALITY,
  },
}

export const Last7Days: Story = {
  args: {
    series: SERIES.slice(-7),
    topDoctors: TOP_DOCTORS,
    modalityBreakdown: MODALITY,
  },
}
