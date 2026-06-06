/**
 * G005 放射RIS系统 v3.0.0 - MSW 56 端点集成测试
 * Phase T1-W11: MSW 拦截验证
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../mockBackend/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MSW Handlers - 56 端点', () => {
  describe('Reports(11)', () => {
    it('GET /reports 返回列表', async () => {
      const res = await fetch('http://localhost:5173/api/v1/reports');
      expect(res.ok).toBe(true);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.meta).toBeDefined();
    });

    it('GET /reports?status=已发布 筛选', async () => {
      const res = await fetch('http://localhost:5173/api/v1/reports?status=已发布');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /reports/stats 统计', async () => {
      const res = await fetch('http://localhost:5173/api/v1/reports/stats');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.total).toBeGreaterThan(0);
    });

    it('POST /reports 创建报告', async () => {
      const res = await fetch('http://localhost:5173/api/v1/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: 'EX001', findings: '测试所见', diagnosis: '测试诊断' }),
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.id).toBeDefined();
      expect(data.data.status).toBe('待分配');
    });

    it('POST /reports/:id/submit 提交', async () => {
      const res = await fetch('http://localhost:5173/api/v1/reports/rpt-001/submit', {
        method: 'POST',
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('已提交');
    });
  });

  describe('Worklist(9)', () => {
    it('GET /worklist 列表', async () => {
      const res = await fetch('http://localhost:5173/api/v1/worklist');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('POST /worklist/:id/checkin 报到', async () => {
      const res = await fetch('http://localhost:5173/api/v1/worklist/EX001/checkin', {
        method: 'POST',
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('已报到');
    });
  });

  describe('Patients(6)', () => {
    it('GET /patients 列表', async () => {
      const res = await fetch('http://localhost:5173/api/v1/patients');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /patients/:id 详情', async () => {
      const res = await fetch('http://localhost:5173/api/v1/patients/P001');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /patients/:id/exams 历史', async () => {
      const res = await fetch('http://localhost:5173/api/v1/patients/P001/exams');
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Devices(5)', () => {
    it('GET /devices 列表', async () => {
      const res = await fetch('http://localhost:5173/api/v1/devices');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /devices/stats/today 今日统计', async () => {
      const res = await fetch('http://localhost:5173/api/v1/devices/stats/today');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.totalDevices).toBeDefined();
    });

    it('PUT /devices/:id/status 状态切换', async () => {
      const res = await fetch('http://localhost:5173/api/v1/devices/dev-001/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'inUse' }),
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('inUse');
    });
  });

  describe('DICOM(7)', () => {
    it('GET /dicom/studies/:studyUid', async () => {
      const res = await fetch('http://localhost:5173/api/v1/dicom/studies/study-001');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.studyInstanceUID).toBe('study-001');
    });

    it('GET /dicom/series/:seriesUid', async () => {
      const res = await fetch('http://localhost:5173/api/v1/dicom/series/series-001');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /dicom/studies/:studyUid/thumbnail 返回 binary', async () => {
      const res = await fetch('http://localhost:5173/api/v1/dicom/studies/study-001/thumbnail');
      expect(res.ok).toBe(true);
      expect(res.headers.get('Content-Type')).toBe('image/jpeg');
    });
  });

  describe('AI(3)', () => {
    it('POST /ai/generate 起草', async () => {
      const res = await fetch('http://localhost:5173/api/v1/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: 'generate', context: { modality: 'CT', bodyPart: '胸部' } }),
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.content).toBeDefined();
    });

    it('POST /ai/quality 质控', async () => {
      const res = await fetch('http://localhost:5173/api/v1/ai/quality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.score).toBeDefined();
    });

    it('POST /ai/rads RADS 分级', async () => {
      const res = await fetch('http://localhost:5173/api/v1/ai/rads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ findings: '8mm 结节', radsSystem: 'Lung-RADS' }),
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.category).toBe('4A');
    });
  });

  describe('Critical Values(5)', () => {
    it('GET /critical 列表', async () => {
      const res = await fetch('http://localhost:5173/api/v1/critical');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('PUT /critical/:id/acknowledge 确认', async () => {
      const res = await fetch('http://localhost:5173/api/v1/critical/cv-001/acknowledge', {
        method: 'PUT',
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('acknowledged');
    });

    it('PUT /critical/:id/resolve 闭环', async () => {
      const res = await fetch('http://localhost:5173/api/v1/critical/cv-001/resolve', {
        method: 'PUT',
      });
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('resolved');
    });
  });

  describe('Print(4)', () => {
    it('GET /print/queue 队列', async () => {
      const res = await fetch('http://localhost:5173/api/v1/print/queue');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /print/printers 打印机', async () => {
      const res = await fetch('http://localhost:5173/api/v1/print/printers');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe('Stats(4)', () => {
    it('GET /stats/daily 今日', async () => {
      const res = await fetch('http://localhost:5173/api/v1/stats/daily');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.totalExams).toBeDefined();
    });

    it('GET /stats/quality 质量', async () => {
      const res = await fetch('http://localhost:5173/api/v1/stats/quality');
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Terms(2)', () => {
    it('GET /terms/search?q=肺', async () => {
      const res = await fetch('http://localhost:5173/api/v1/terms/search?q=肺');
      const data = await res.json();
      expect(data.success).toBe(true);
    });

    it('GET /terms/categories 分类', async () => {
      const res = await fetch('http://localhost:5173/api/v1/terms/categories');
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.length).toBe(7);  // 7 类
    });
  });
});
