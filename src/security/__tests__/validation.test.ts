/**
 * G005 放射RIS系统 v3.0.0 - 校验 + 脱敏测试
 * Phase T1-W2: 安全测试
 */

import { describe, it, expect } from 'vitest';
import {
  schemas,
  validateInput,
  formatZodErrors,
  maskName,
  maskIdCard,
  maskPhone,
  maskEmail,
  maskDiagnosis,
  maskPatient,
  hasSQLInjection,
  hasXSSAttempt,
  sanitizeHTML,
  isSafeURL,
} from '../index';

describe('Zod Schemas - 关键输入校验', () => {
  describe('LoginInput', () => {
    it('接受合法登录', () => {
      const r = schemas.LoginInput.safeParse({ username: 'admin', password: 'secret123' });
      expect(r.success).toBe(true);
    });

    it('拒绝太短用户名', () => {
      const r = schemas.LoginInput.safeParse({ username: 'ab', password: 'secret123' });
      expect(r.success).toBe(false);
    });

    it('拒绝太短密码', () => {
      const r = schemas.LoginInput.safeParse({ username: 'admin', password: '123' });
      expect(r.success).toBe(false);
    });
  });

  describe('PatientInput', () => {
    it('接受合法患者', () => {
      const r = schemas.PatientInput.safeParse({
        name: '张明远',
        gender: '男',
        birthDate: '1980-06-06',
        idCard: '11010119800606001X',
        phone: '13800138000',
      });
      expect(r.success).toBe(true);
    });

    it('拒绝错误身份证', () => {
      const r = schemas.PatientInput.safeParse({
        name: '张明远',
        gender: '男',
        birthDate: '1980-06-06',
        idCard: 'invalid',
      });
      expect(r.success).toBe(false);
    });

    it('拒绝错误手机号', () => {
      const r = schemas.PatientInput.safeParse({
        name: '张明远',
        gender: '男',
        birthDate: '1980-06-06',
        phone: '12345',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('ReportInput', () => {
    it('接受合法报告', () => {
      const r = schemas.ReportInput.safeParse({
        examId: 'EX001',
        findings: '右肺上叶见磨玻璃结节影,直径约 8mm',
        diagnosis: '考虑肺腺癌可能',
        impression: '建议 3 个月复查',
      });
      expect(r.success).toBe(true);
    });

    it('拒绝太短所见', () => {
      const r = schemas.ReportInput.safeParse({
        examId: 'EX001',
        findings: '太短',
        diagnosis: '考虑肺腺癌可能',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('ChangePassword', () => {
    it('接受强密码', () => {
      const r = schemas.ChangePassword.safeParse({
        oldPassword: 'oldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      });
      expect(r.success).toBe(true);
    });

    it('拒绝弱密码(无大写)', () => {
      const r = schemas.ChangePassword.safeParse({
        oldPassword: 'oldPass123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123',
      });
      expect(r.success).toBe(false);
    });

    it('拒绝两次密码不一致', () => {
      const r = schemas.ChangePassword.safeParse({
        oldPassword: 'oldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass456',
      });
      expect(r.success).toBe(false);
    });
  });

  describe('CriticalValueInput', () => {
    it('接受合法危急值', () => {
      const r = schemas.CriticalValueInput.safeParse({
        examId: 'EX001',
        finding: '主动脉夹层,Stanford A 型',
        category: 'CV-RAD-001',
        severity: 'critical',
        notifyMethods: ['phone', 'sms'],
        contactDept: '心外科',
        contactDoctor: '王医生',
      });
      expect(r.success).toBe(true);
    });

    it('拒绝错误目录编码', () => {
      const r = schemas.CriticalValueInput.safeParse({
        examId: 'EX001',
        finding: '危急值',
        category: 'CV-INVALID',
        severity: 'critical',
        notifyMethods: ['phone'],
        contactDept: '心外科',
        contactDoctor: '王医生',
      });
      expect(r.success).toBe(false);
    });
  });
});

describe('数据脱敏 - HIPAA 合规', () => {
  describe('姓名', () => {
    it('2 字姓名:张伟 → 张*', () => {
      expect(maskName('张伟')).toBe('张*');
    });
    it('3 字姓名:张明远 → 张*远', () => {
      expect(maskName('张明远')).toBe('张*远');
    });
    it('4 字姓名:欧阳明月 → 欧**月', () => {
      expect(maskName('欧阳明月')).toBe('欧**月');
    });
    it('1 字姓名原样', () => {
      expect(maskName('A')).toBe('A');
    });
    it('空字符串', () => {
      expect(maskName('')).toBe('');
    });
  });

  describe('身份证', () => {
    it('18 位身份证:110101199003078888 → 110101********8888', () => {
      expect(maskIdCard('110101199003078888')).toBe('110101********8888');
    });
    it('太短不动', () => {
      expect(maskIdCard('12345')).toBe('12345');
    });
  });

  describe('手机号', () => {
    it('11 位手机:13800138000 → 138****8000', () => {
      expect(maskPhone('13800138000')).toBe('138****8000');
    });
    it('非 11 位不动', () => {
      expect(maskPhone('12345')).toBe('12345');
    });
  });

  describe('邮箱', () => {
    it('zhangsan@hospital.com → zha***@hospital.com', () => {
      expect(maskEmail('zhangsan@hospital.com')).toBe('zha***@hospital.com');
    });
    it('短 local:ab@test.com → a***@test.com', () => {
      expect(maskEmail('ab@test.com')).toBe('a***@test.com');
    });
  });

  describe('诊断', () => {
    it('长诊断保留前 10 字', () => {
      expect(maskDiagnosis('右肺上叶见磨玻璃结节,直径约 8mm,建议 3 个月后复查')).toBe('右肺上叶见磨玻璃结节***[共 29 字]');
    });
    it('短诊断原样', () => {
      expect(maskDiagnosis('肺结节')).toBe('肺结节');
    });
  });

  describe('完整患者', () => {
    it('整体脱敏', () => {
      const masked = maskPatient({
        name: '张明远',
        idCard: '110101199003078888',
        phone: '13800138000',
        email: 'zhangmy@hospital.com',
        diagnosis: '右肺上叶见磨玻璃结节,直径约 8mm',
      });
      expect(masked).toEqual({
        name: '张*远',
        idCard: '110101********8888',
        phone: '138****8000',
        email: 'zha***@hospital.com',
        diagnosis: '右肺上叶见磨玻璃结节,直径约 8mm',
      });
    });
  });
});

describe('安全检测', () => {
  describe('SQL 注入', () => {
    it("检测 UNION SELECT", () => {
      expect(hasSQLInjection("' UNION SELECT * FROM users--")).toBe(true);
    });
    it("检测 OR '1'='1", () => {
      expect(hasSQLInjection("admin' OR '1'='1")).toBe(true);
    });
    it('合法输入不触发', () => {
      expect(hasSQLInjection('正常用户输入')).toBe(false);
    });
  });

  describe('XSS', () => {
    it('检测 <script>', () => {
      expect(hasXSSAttempt('<script>alert(1)</script>')).toBe(true);
    });
    it('检测 javascript:', () => {
      expect(hasXSSAttempt('javascript:alert(1)')).toBe(true);
    });
    it('检测 onclick', () => {
      expect(hasXSSAttempt('<img src=x onerror=alert(1)>')).toBe(true);
    });
    it('合法输入不触发', () => {
      expect(hasXSSAttempt('普通文本')).toBe(false);
    });
  });

  describe('URL 安全', () => {
    it('https 允许', () => {
      expect(isSafeURL('https://hospital.com/report.pdf')).toBe(true);
    });
    it('http 允许', () => {
      expect(isSafeURL('http://internal/page')).toBe(true);
    });
    it('javascript: 拒绝', () => {
      expect(isSafeURL('javascript:alert(1)')).toBe(false);
    });
    it('data: 拒绝', () => {
      expect(isSafeURL('data:text/html,<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('HTML 清理', () => {
    it('移除 <script>', () => {
      const result = sanitizeHTML('<p>安全</p><script>alert(1)</script>');
      expect(result).not.toContain('<script>');
      expect(result).toContain('<p>安全</p>');
    });
    it('移除 onclick', () => {
      const result = sanitizeHTML('<a href="x" onclick="alert(1)">链接</a>');
      expect(result).not.toContain('onclick');
    });
  });
});

describe('工具函数', () => {
  it('validateInput 成功', () => {
    const r = validateInput(schemas.LoginInput, { username: 'admin', password: 'secret123' });
    expect(r.success).toBe(true);
  });

  it('validateInput 失败', () => {
    const r = validateInput(schemas.LoginInput, { username: 'a', password: 'b' });
    expect(r.success).toBe(false);
    if (!r.success) {
      const formatted = formatZodErrors(r.errors);
      expect(formatted.length).toBeGreaterThan(0);
    }
  });
});
