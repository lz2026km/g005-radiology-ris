/**
 * G005 放射RIS系统 v3.0.2.2 - ReportsQualityModule 形状 e2e
 */
import { Test } from '@nestjs/testing'
import { ReportsQualityController } from '../src/reports-quality/reports-quality.controller'
import { ReportsQualityService } from '../src/reports-quality/reports-quality.service'
import { PrismaService } from '../src/prisma/prisma.service'

class MockPrisma {
  reportQualityScore = {
    create: (args: any) => Promise.resolve({ id: 'mock', ...args.data }),
    findMany: () => Promise.resolve([]),
  }
  $connect = () => Promise.resolve()
  $disconnect = () => Promise.resolve()
}

describe('ReportsQualityModule (5 endpoints)', () => {
  let ctrl: ReportsQualityController
  let svc: ReportsQualityService

  beforeAll(async () => {
    const m = await Test.createTestingModule({
      controllers: [ReportsQualityController],
      providers: [
        ReportsQualityService,
        { provide: PrismaService, useClass: MockPrisma },
      ],
    }).compile()
    ctrl = m.get(ReportsQualityController)
    svc = m.get(ReportsQualityService)
  })

  describe('GET rules', () => {
    it('returns 8 dimensions with weights', () => {
      const r = ctrl.rules()
      expect(r.dimensions.length).toBe(8)
      expect(r.dimensions[0].max).toBe(20)
      expect(r.dimensions.reduce((s, d) => s + d.weight, 0)).toBeCloseTo(1.0)
    })
    it('returns 5 grade thresholds', () => {
      const r = ctrl.rules()
      expect(r.grades.length).toBe(5)
      expect(r.grades[0].grade).toBe('A')
    })
    it('returns blacklist', () => {
      const r = ctrl.rules()
      expect(r.blacklist).toContain('TODO')
    })
  })

  describe('POST evaluate', () => {
    it('returns A or B grade for high quality report', async () => {
      const r = await ctrl.evaluate({
        reportId: 'R1',
        findings: '双肺纹理清晰,气管居中,纵隔对称,规则,均匀,正常,未见异常。',
        conclusion: '双肺未见明显异常。',
        radsCategory: 'Lung-RADS 1',
        structuredCompletion: 0.95,
        verified: true,
        hasCritical: false,
      })
      expect(['A', 'B']).toContain(r.grade)
      expect(r.totalScore).toBeGreaterThanOrEqual(80)
    })

    it('returns F grade for poor report', async () => {
      const r = await ctrl.evaluate({
        reportId: 'R2',
        findings: 'TODO xxx ...',
        conclusion: '...',
        hasCritical: true,
      })
      expect(['D', 'F']).toContain(r.grade)
    })

    it('marks missing RADS in suggestions', async () => {
      const r = await ctrl.evaluate({
        reportId: 'R3',
        findings: '正常,清晰,对称,规则,均匀,未见。'.repeat(2),
        conclusion: '正常。',
        structuredCompletion: 0.8,
        verified: true,
      })
      const radsIssue = r.dimensions.find((d) => d.key === 'rads')
      expect(radsIssue?.issues.length).toBeGreaterThan(0)
    })
  })

  describe('GET history / trend', () => {
    it('history returns empty array initially', async () => {
      const r = await ctrl.history('R1')
      expect(r).toEqual([])
    })
    it('trend returns array', async () => {
      const r = await ctrl.trend('R1', '30')
      expect(Array.isArray(r)).toBe(true)
    })
  })

  describe('POST re-evaluate', () => {
    it('throws when no history', async () => {
      await expect(
        ctrl.reEvaluate('R-NEW', { reportId: 'R-NEW', findings: '正常', conclusion: '正常' })
      ).rejects.toThrow()
    })
  })

  describe('service', () => {
    it('has 5 methods', () => {
      expect(typeof svc.getRules).toBe('function')
      expect(typeof svc.evaluate).toBe('function')
      expect(typeof svc.getHistory).toBe('function')
      expect(typeof svc.getTrend).toBe('function')
      expect(typeof svc.reEvaluate).toBe('function')
    })
  })
})
