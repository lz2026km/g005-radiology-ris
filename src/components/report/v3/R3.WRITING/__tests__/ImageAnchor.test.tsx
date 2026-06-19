import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@data/reportWritingMock', () => ({
  IMAGE_ANCHORS_MOCK: [],
}));
vi.mock('@services/writing/writingService', () => ({
  getImageAnchors: vi.fn(),
  pinImageAnchor: vi.fn(),
  uploadImageToReport: vi.fn(),
}));

import { ImageAnchorComponent } from '../ImageAnchor';

describe('ImageAnchorComponent', () => {
  it('renders annotation tools', () => {
    render(<ImageAnchorComponent reportId="rep-1" />);
    expect(screen.getByText('标注工具')).toBeInTheDocument();
  });
});
