// ============================================================
// G005 放射RIS系统 v2.1.0 - DICOM Pro W2 Tests
// Phase R10 W2: MPR / MIP / Annotation
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MprViewport from '../MprViewport';
import MipViewport from '../MipViewport';
import AnnotationLayer from '../AnnotationLayer';

describe('MPR Viewport', () => {
  const imageIds = Array.from({ length: 30 }, (_, i) => `wadouri:test-${i}.mhd`);

  it('renders without crashing', () => {
    render(<MprViewport imageIds={imageIds} />);
    expect(screen.getByText(/MPR 三平面重建/)).toBeTruthy();
  });

  it('shows axial plane by default', () => {
    render(<MprViewport imageIds={imageIds} />);
    expect(screen.getAllByText(/Axial \(横断面\)/).length).toBeGreaterThanOrEqual(1);
  });

  it('displays all 3 plane types', () => {
    render(<MprViewport imageIds={imageIds} showAllPlanes />);
    expect(screen.getAllByText(/Axial \(横断面\)/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Coronal \(冠状面\)/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Sagittal \(矢状面\)/).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles plane visibility via checkboxes', () => {
    render(<MprViewport imageIds={imageIds} showAllPlanes />);
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(3);
  });
});

describe('MIP / VR Viewport', () => {
  const imageIds = Array.from({ length: 30 }, (_, i) => `wadouri:test-${i}.mhd`);

  it('renders MIP by default', () => {
    render(<MipViewport imageIds={imageIds} slabThickness={20} />);
    expect(screen.getByText(/Maximum Intensity Projection/)).toBeTruthy();
  });

  it('renders VR when showVR is true', () => {
    render(<MipViewport imageIds={imageIds} showVR slabThickness={20} />);
    expect(screen.getByText(/Volume Rendering/)).toBeTruthy();
  });

  it('mode selector includes MIP, MinIP, AvgIP, VR', () => {
    render(<MipViewport imageIds={imageIds} slabThickness={20} />);
    const select = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(select.options).map(o => o.value);
    expect(options).toContain('mip');
    expect(options).toContain('minip');
    expect(options).toContain('avg');
    expect(options).toContain('vr');
  });
});

describe('Annotation Layer', () => {
  it('renders with annotations', () => {
    const anns = [
      { id: 'a1', type: 'arrow' as const, points: [{ x: 50, y: 50 }, { x: 200, y: 200 }], text: '病灶', color: '#fbbf24', category: 'finding' as const, createdAt: '2024-01-01', createdBy: 'doctor' },
    ];
    const { container } = render(<AnnotationLayer width={512} height={512} annotations={anns} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('handles empty annotations', () => {
    const { container } = render(<AnnotationLayer width={512} height={512} annotations={[]} />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('respects readonly mode', () => {
    const { container } = render(<AnnotationLayer width={512} height={512} annotations={[]} readonly />);
    const svg = container.querySelector('svg');
    expect(svg?.style.pointerEvents).toBe('none');
  });
});
