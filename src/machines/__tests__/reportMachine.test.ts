/**
 * G005 放射RIS系统 v3.0.0 - 报告状态机测试
 * Phase T1-W2: 状态机单元测试
 */

import { describe, it, expect } from 'vitest';
import { createActor } from 'xstate';
import { reportMachine, REPORT_STATE_GROUPS } from '../reportMachine';

const INPUT = { reportId: 'rpt-001', patientId: 'P001', radiologistId: 'D001' };

const startActor = () =>
  createActor(reportMachine, { input: INPUT }).start();

describe('reportMachine - 报告 14 态状态机', () => {
  describe('Draft 三态', () => {
    it('初始为 pendingAssignment', () => {
      const actor = startActor();
      expect(actor.getSnapshot().value).toBe('pendingAssignment');
    });

    it('pendingAssignment → assigned (ASSIGN)', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      expect(actor.getSnapshot().value).toBe('assigned');
      expect(actor.getSnapshot().context.radiologistId).toBe('D002');
      expect(actor.getSnapshot().context.history).toHaveLength(1);
    });

    it('assigned → writing (START_WRITING)', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      expect(actor.getSnapshot().value).toBe('writing');
    });

    it('writing 支持 UPDATE_CONTENT', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({
        type: 'UPDATE_CONTENT',
        findings: '右肺上叶见磨玻璃结节',
        diagnosis: '考虑肺腺癌',
      });
      const ctx = actor.getSnapshot().context;
      expect(ctx.findings).toBe('右肺上叶见磨玻璃结节');
      expect(ctx.diagnosis).toBe('考虑肺腺癌');
      expect(ctx.impression).toBe('');
    });
  });

  describe('Review 三态', () => {
    it('writing → submitted (SUBMIT)', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      expect(actor.getSnapshot().value).toBe('submitted');
    });

    it('submitted → reviewing (START_REVIEW)', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      expect(actor.getSnapshot().value).toBe('reviewing');
      expect(actor.getSnapshot().context.reviewerId).toBe('D003');
    });

    it('reviewing → reviewed (APPROVE)', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      actor.send({ type: 'APPROVE' });
      expect(actor.getSnapshot().value).toBe('reviewed');
    });
  });

  describe('Sign 二态', () => {
    const toReviewed = () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      actor.send({ type: 'APPROVE' });
      return actor;
    };

    it('reviewed → signing (START_SIGN)', () => {
      const actor = toReviewed();
      actor.send({ type: 'START_SIGN' });
      expect(actor.getSnapshot().value).toBe('signing');
    });

    it('signing → signed (COMPLETE_SIGN) 记录签名时间', () => {
      const actor = toReviewed();
      actor.send({ type: 'START_SIGN' });
      const signedAt = '2026-06-06T10:00:00.000Z';
      actor.send({ type: 'COMPLETE_SIGN', signedAt });
      expect(actor.getSnapshot().value).toBe('signed');
      expect(actor.getSnapshot().context.signedAt).toBe(signedAt);
    });
  });

  describe('Published 一态', () => {
    const toSigned = () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      actor.send({ type: 'APPROVE' });
      actor.send({ type: 'START_SIGN' });
      actor.send({ type: 'COMPLETE_SIGN', signedAt: '2026-06-06T10:00:00.000Z' });
      return actor;
    };

    it('signed → published (PUBLISH)', () => {
      const actor = toSigned();
      actor.send({ type: 'PUBLISH' });
      expect(actor.getSnapshot().value).toBe('published');
    });

    it('published → amending (START_AMEND)', () => {
      const actor = toSigned();
      actor.send({ type: 'PUBLISH' });
      actor.send({ type: 'START_AMEND', reason: '新增征象' });
      expect(actor.getSnapshot().value).toBe('amending');
      expect(actor.getSnapshot().context.amendmentReason).toBe('新增征象');
    });

    it('amending → amended (COMPLETE_AMEND)', () => {
      const actor = toSigned();
      actor.send({ type: 'PUBLISH' });
      actor.send({ type: 'START_AMEND', reason: '新增征象' });
      actor.send({ type: 'COMPLETE_AMEND' });
      expect(actor.getSnapshot().value).toBe('amended');
    });
  });

  describe('Special 五态 - 撤回 / 驳回 / 修订 / 归档', () => {
    it('任意草稿态 → withdrawn (WITHDRAW)', () => {
      const actor = startActor();
      actor.send({ type: 'WITHDRAW' });
      expect(actor.getSnapshot().value).toBe('withdrawn');
    });

    it('reviewing → rejected (REJECT) 记录原因', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      actor.send({ type: 'REJECT', reason: '描述不完整' });
      expect(actor.getSnapshot().value).toBe('rejected');
      expect(actor.getSnapshot().context.rejectReason).toBe('描述不完整');
    });

    it('rejected → writing (RESTART) 可重写', () => {
      const actor = startActor();
      actor.send({ type: 'ASSIGN', radiologistId: 'D002' });
      actor.send({ type: 'START_WRITING' });
      actor.send({ type: 'SUBMIT' });
      actor.send({ type: 'START_REVIEW', reviewerId: 'D003' });
      actor.send({ type: 'REJECT', reason: '需补充' });
      actor.send({ type: 'RESTART' });
      expect(actor.getSnapshot().value).toBe('writing');
      expect(actor.getSnapshot().context.rejectReason).toBeNull();
    });

    it('任意态 → archived (ARCHIVE)', () => {
      const actor = startActor();
      actor.send({ type: 'ARCHIVE' });
      expect(actor.getSnapshot().value).toBe('archived');
    });
  });

  describe('状态分组', () => {
    it('draft 组含 3 态', () => {
      expect(REPORT_STATE_GROUPS.draft).toEqual(['pendingAssignment', 'assigned', 'writing']);
    });
    it('review 组含 3 态', () => {
      expect(REPORT_STATE_GROUPS.review).toEqual(['submitted', 'reviewing', 'reviewed']);
    });
    it('sign 组含 2 态', () => {
      expect(REPORT_STATE_GROUPS.sign).toEqual(['signing', 'signed']);
    });
    it('published 组含 1 态', () => {
      expect(REPORT_STATE_GROUPS.published).toEqual(['published']);
    });
    it('special 组含 5 态', () => {
      expect(REPORT_STATE_GROUPS.special).toEqual(['amending', 'amended', 'withdrawn', 'rejected', 'archived']);
    });
    it('总 14 态', () => {
      const total = Object.values(REPORT_STATE_GROUPS).flat().length;
      expect(total).toBe(14);
    });
  });
});
