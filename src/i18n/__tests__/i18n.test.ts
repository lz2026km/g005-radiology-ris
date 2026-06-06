/**
 * G005 放射RIS系统 v3.0.0 - i18n 测试
 * Phase T1-W2: 国际化测试
 */

import { describe, it, expect, beforeAll } from 'vitest';
import i18n, { changeLanguage, getCurrentLanguage, SUPPORTED_LANGUAGES, LANGUAGE_META } from '../index';

describe('i18n - 国际化', () => {
  beforeAll(async () => {
    await i18n.init();
  });

  describe('基础功能', () => {
    it('支持 zh_CN 和 en_US', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['zh_CN', 'en_US']);
    });

    it('包含 2 种语言元数据', () => {
      expect(Object.keys(LANGUAGE_META)).toHaveLength(2);
      expect(LANGUAGE_META.zh_CN?.nativeName).toBe('简体中文');
      expect(LANGUAGE_META.en_US?.nativeName).toBe('English');
    });
  });

  describe('中文(默认)', () => {
    it('common.save = 保存', () => {
      expect(i18n.t('common.save')).toBe('保存');
    });

    it('nav.home = 首页', () => {
      expect(i18n.t('nav.home')).toBe('首页');
    });

    it('status.pendingAssignment = 待分配', () => {
      expect(i18n.t('status.pendingAssignment')).toBe('待分配');
    });

    it('report.findings = 影像所见', () => {
      expect(i18n.t('report.findings')).toBe('影像所见');
    });

    it('critical.categories 含 15 类', () => {
      expect(i18n.t('critical.categories.CV-RAD-001')).toBe('主动脉夹层');
      expect(i18n.t('critical.categories.CV-RAD-015')).toBe('宫外孕破裂');
    });
  });

  describe('英文', () => {
    beforeAll(async () => {
      await changeLanguage('en_US');
    });

    it('common.save = Save', () => {
      expect(i18n.t('common.save')).toBe('Save');
    });

    it('nav.home = Home', () => {
      expect(i18n.t('nav.home')).toBe('Home');
    });

    it('status.pendingAssignment = Pending Assignment', () => {
      expect(i18n.t('status.pendingAssignment')).toBe('Pending Assignment');
    });

    it('report.findings = Findings', () => {
      expect(i18n.t('report.findings')).toBe('Findings');
    });

    it('critical.categories 英文版', () => {
      expect(i18n.t('critical.categories.CV-RAD-001')).toBe('Aortic Dissection');
      expect(i18n.t('critical.categories.CV-RAD-002')).toBe('Pulmonary Embolism');
    });
  });

  describe('切换语言', () => {
    it('changeLanguage 切换 zh_CN → en_US', async () => {
      await changeLanguage('en_US');
      expect(getCurrentLanguage()).toBe('en_US');
    });

    it('changeLanguage 切换 en_US → zh_CN', async () => {
      await changeLanguage('zh_CN');
      expect(getCurrentLanguage()).toBe('zh_CN');
    });
  });

  describe('插值', () => {
    it('支持命名插值', () => {
      i18n.addResource('zh_CN', 'test', 'greet', '你好,{{name}}!');
      expect(i18n.t('test:greet', { name: '张医生' })).toBe('你好,张医生!');
    });

    it('支持命名插值(英文)', () => {
      i18n.addResource('en_US', 'test', 'greet', 'Hello, {{name}}!');
      expect(i18n.t('test:greet', { name: 'Dr. Smith' })).toBe('Hello, Dr. Smith!');
    });
  });

  describe('DICOM 术语', () => {
    it('中文 DICOM 工具齐全', () => {
      expect(i18n.t('dicom.zoom')).toBe('缩放');
      expect(i18n.t('dicom.measure')).toBe('测量');
      expect(i18n.t('dicom.MPR')).toBe('多平面重建');
      expect(i18n.t('dicom.MIP')).toBe('最大密度投影');
    });

    it('英文 DICOM 工具齐全', async () => {
      await changeLanguage('en_US');
      expect(i18n.t('dicom.zoom')).toBe('Zoom');
      expect(i18n.t('dicom.measure')).toBe('Measure');
      expect(i18n.t('dicom.MPR')).toBe('MPR');
      expect(i18n.t('dicom.MIP')).toBe('MIP');
    });
  });
});
