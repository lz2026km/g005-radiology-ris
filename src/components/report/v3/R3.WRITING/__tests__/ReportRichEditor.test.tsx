import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@data/reportWritingMock', () => ({
  RICH_DOCUMENT_MOCK: {
    reportId: 'rep-1',
    version: '1.0',
    html: '<p>mock</p>',
    plainText: 'mock',
    wordCount: 4,
    charCount: 4,
    paragraphCount: 1,
    images: [],
    style: { fontFamily: 'SimSun', fontSize: 14, lineHeight: 1.6, letterSpacing: 0 },
    autoSaveAt: null,
  },
}));
vi.mock('@services/writing/writingService', () => ({
  getRichDocument: vi.fn(),
  saveRichDocument: vi.fn(),
  autoSaveDocument: vi.fn(),
  spellCheck: vi.fn(),
}));

import { ReportRichEditor } from '../ReportRichEditor';

describe('ReportRichEditor', () => {
  it('renders without crashing', () => {
    const { container } = render(<ReportRichEditor reportId="rep-1" />);
    expect(container).toBeTruthy();
  });

  it('renders toolbar buttons', () => {
    render(<ReportRichEditor reportId="rep-1" />);
    expect(screen.getByText('富文本编辑器')).toBeInTheDocument();
  });
});
