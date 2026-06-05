// ============================================================
// G005 放射RIS系统 v2.1.0 - R10 W3 Tests
// Phase R10 W3: ImageAnchor + DICOM-SR Export
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageAnchorChip, { renderTextWithAnchors } from '../ImageAnchorChip';
import type { ImageAnchor } from '../../../types/imageAnchor';
import { exportToDicomSr, isDicomSrJson, exportToDicomSrBuffer } from '../../../services/dicomSrExporter';
import { parseDicomWebRef } from '../../../types/imageAnchor';

const baseAnchor: Omit<ImageAnchor, 'id' | 'createdAt'> = {
  reportId: 'rep-1',
  frame: { seriesInstanceUID: '1.2.3.4', sopInstanceUID: '1.2.3.4.1', plane: 'axial' },
  category: 'finding',
  createdBy: 'doc-1',
  label: '病灶 #1',
};

describe('ImageAnchorChip', () => {
  it('renders label', () => {
    const a: ImageAnchor = { ...baseAnchor, id: 'a1', createdAt: '2024-01-01' };
    render(<ImageAnchorChip anchor={a} />);
    expect(screen.getByText('病灶 #1')).toBeTruthy();
  });

  it('shows measurement value when present', () => {
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a2', createdAt: '2024-01-01',
      measurement: { type: 'length', value: 12.4, unit: 'mm', points: [{ x: 0, y: 0 }, { x: 50, y: 50 }] },
    };
    render(<ImageAnchorChip anchor={a} />);
    expect(screen.getByText(/12\.4/)).toBeTruthy();
  });

  it('renders AI badge when AI detected', () => {
    const a: ImageAnchor = { ...baseAnchor, id: 'a3', createdAt: '2024-01-01', isAIDetected: true };
    render(<ImageAnchorChip anchor={a} />);
    expect(screen.getByText('AI')).toBeTruthy();
  });

  it('renders critical badge when critical', () => {
    const a: ImageAnchor = { ...baseAnchor, id: 'a4', createdAt: '2024-01-01', isCritical: true };
    render(<ImageAnchorChip anchor={a} />);
    expect(screen.getByText('⚠')).toBeTruthy();
  });

  it('has distinct color per category', () => {
    const categories: Array<ImageAnchor['category']> = ['finding', 'lesion', 'organ', 'measurement', 'critical', 'reference', 'comparison'];
    const ids: string[] = [];
    categories.forEach((cat, i) => {
      const a: ImageAnchor = { ...baseAnchor, id: `a-cat-${i}`, createdAt: '2024-01-01', category: cat };
      const { container } = render(<ImageAnchorChip anchor={a} />);
      const chip = container.querySelector('span');
      const bg = chip?.style.background;
      ids.push(`${cat}:${bg}`);
    });
    const uniqueBgs = new Set(ids.map(s => s.split(':')[1]));
    expect(uniqueBgs.size).toBeGreaterThanOrEqual(5);
  });

  it('renders remove button when onRemove is provided', () => {
    const a: ImageAnchor = { ...baseAnchor, id: 'a5', createdAt: '2024-01-01' };
    render(<ImageAnchorChip anchor={a} onRemove={() => {}} />);
    expect(screen.getByLabelText('移除锚定')).toBeTruthy();
  });
});

describe('renderTextWithAnchors', () => {
  it('returns plain text when no anchors', () => {
    expect(renderTextWithAnchors({ text: 'no anchors here', anchors: [] })).toBe('no anchors here');
  });

  it('inlines chips at textRange positions', () => {
    const text = '见肝脏病灶 #1，大小约12mm。';
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a-tx', createdAt: '2024-01-01',
      textRange: { start: 1, end: 5 },
    };
    const { container } = render(<>{renderTextWithAnchors({ text, anchors: [a] })}</>);
    expect(container.textContent).toContain('见');
    expect(container.textContent).toContain('病灶 #1');
    expect(container.textContent).toContain('12mm');
  });

  it('handles multiple anchors sorted by position', () => {
    const text = 'ABCDEFG';
    const a1: ImageAnchor = { ...baseAnchor, id: 'a-m1', createdAt: '2024-01-01', textRange: { start: 1, end: 2 } };
    const a2: ImageAnchor = { ...baseAnchor, id: 'a-m2', createdAt: '2024-01-01', textRange: { start: 4, end: 5 } };
    const { container } = render(<>{renderTextWithAnchors({ text, anchors: [a2, a1] })}</>);
    const chips = container.querySelectorAll('[data-testid^="anchor-chip-"]');
    expect(chips.length).toBe(2);
  });
});

describe('parseDicomWebRef', () => {
  it('parses wadouri:// URL', () => {
    const ref = parseDicomWebRef('wadouri:https://server/studies/S1/series/SE1/instances/I1');
    expect(ref).toBeTruthy();
    expect(ref!.seriesInstanceUID).toBe('SE1');
    expect(ref!.sopInstanceUID).toBe('I1');
  });

  it('parses dicom:// URL', () => {
    const ref = parseDicomWebRef('dicom://SE1/I1');
    expect(ref!.seriesInstanceUID).toBe('SE1');
    expect(ref!.sopInstanceUID).toBe('I1');
  });

  it('returns null for invalid URL', () => {
    expect(parseDicomWebRef('not-a-url')).toBeNull();
  });
});

describe('exportToDicomSr', () => {
  const baseOpts = {
    reportId: 'rep-1',
    studyInstanceUID: '1.2.3',
    seriesInstanceUID: '1.2.3.4',
    sopInstanceUID: '1.2.3.4.1',
    reportText: '肝脏内见一低密度灶，大小约12mm×8mm。',
    anchors: [] as ImageAnchor[],
    conceptCodeScheme: 'DCM' as const,
    observerName: 'Dr. Test',
  };

  it('emits Basic Text SR (TID 2000) when no measurements', () => {
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a-sr1', createdAt: '2024-01-01',
      textRange: { start: 0, end: 6 },
      label: '肝脏',
    };
    const doc = exportToDicomSr({ ...baseOpts, anchors: [a] });
    expect(doc.sopClassUID).toBe('1.2.840.10008.5.1.4.1.1.88.11');
    expect(doc.completionFlag).toBe('COMPLETE');
    expect(doc.contentSequence.length).toBeGreaterThan(0);
    const textItem = doc.contentSequence.find(c => c.valueType === 'TEXT' && c.conceptNameCodeSequence?.codeValue === 'ReportText');
    expect(textItem).toBeTruthy();
  });

  it('emits Enhanced SR (TID 1500) when measurements present', () => {
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a-sr2', createdAt: '2024-01-01',
      measurement: { type: 'length', value: 12.4, unit: 'mm', points: [{ x: 10, y: 10 }, { x: 60, y: 60 }] },
    };
    const doc = exportToDicomSr({ ...baseOpts, anchors: [a] });
    expect(doc.sopClassUID).toBe('1.2.840.10008.5.1.4.1.1.88.22');
    expect(doc.conceptNameCodeSequence.codeValue).toBe('126000');
    const group = doc.contentSequence.find(c => c.valueType === 'CONTAINER' && c.conceptNameCodeSequence?.codeValue === '125007');
    expect(group).toBeTruthy();
    const num = group?.contentSequence?.find(c => c.valueType === 'NUM');
    expect(num?.numericValue?.value).toBe(12.4);
    expect(num?.numericValue?.unitCode.codeValue).toBe('mm');
    expect(num?.graphicType).toBe('POLYLINE');
    expect(num?.graphicData).toEqual([10, 10, 60, 60]);
  });

  it('includes critical + AI flags in measurement group', () => {
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a-sr3', createdAt: '2024-01-01',
      measurement: { type: 'area', value: 45.6, unit: 'mm2', points: [{ x: 0, y: 0 }] },
      isCritical: true,
      isAIDetected: true,
    };
    const doc = exportToDicomSr({ ...baseOpts, anchors: [a] });
    const group = doc.contentSequence.find(c => c.conceptNameCodeSequence?.codeValue === '125007');
    const critFlag = group?.contentSequence?.find(c => c.conceptNameCodeSequence?.codeValue === 'CriticalFinding');
    const aiFlag = group?.contentSequence?.find(c => c.conceptNameCodeSequence?.codeValue === 'AIDetected');
    expect(critFlag).toBeTruthy();
    expect(aiFlag).toBeTruthy();
  });

  it('references source image SOP', () => {
    const a: ImageAnchor = {
      ...baseAnchor, id: 'a-sr4', createdAt: '2024-01-01',
      measurement: { type: 'length', value: 5, unit: 'mm', points: [{ x: 0, y: 0 }, { x: 10, y: 0 }] },
    };
    const doc = exportToDicomSr({ ...baseOpts, anchors: [a] });
    const group = doc.contentSequence.find(c => c.conceptNameCodeSequence?.codeValue === '125007');
    expect(group?.referencedImageSequence?.[0].referencedSOPInstanceUID).toBe('1.2.3.4.1');
  });

  it('observer context is set', () => {
    const doc = exportToDicomSr({ ...baseOpts, anchors: [] });
    expect(doc.observerContext.observerType).toBe('PSN');
    expect(doc.observerContext.personName).toBe('Dr. Test');
  });

  it('generates unique SOP Instance UID per call', () => {
    const a = exportToDicomSr({ ...baseOpts, anchors: [] });
    const b = exportToDicomSr({ ...baseOpts, anchors: [] });
    expect(a.sopInstanceUID).not.toBe(b.sopInstanceUID);
  });

  it('async export returns JSON fallback when dcmjs unavailable', async () => {
    const doc = exportToDicomSr({ ...baseOpts, anchors: [] });
    const buf = await exportToDicomSrBuffer(doc);
    expect(buf.length).toBeGreaterThan(0);
    // dcmjs 不可用 → 走 JSON
    expect(isDicomSrJson(buf)).toBe(true);
  });
});
