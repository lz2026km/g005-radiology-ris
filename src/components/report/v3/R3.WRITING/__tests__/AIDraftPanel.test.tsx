import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@data/reportWritingMock', () => ({
  AI_DRAFT_RESULT: null,
  SIMILAR_CASES_MOCK: [],
  PRIOR_REPORTS_MOCK: [],
}));
vi.mock('@services/writing/writingService', () => ({
  generateAiDraft: vi.fn(),
  getAiDraftStatus: vi.fn(),
}));

import { AIDraftPanel } from '../AIDraftPanel';

describe('AIDraftPanel', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <AIDraftPanel reportId="rep-1" clinicalInfo="咳嗽咳痰" modality="CT" bodyPart="胸部" />
    );
    expect(container).toBeTruthy();
  });

  it('renders the draft tab label', () => {
    render(
      <AIDraftPanel reportId="rep-1" clinicalInfo="咳嗽咳痰" modality="CT" bodyPart="胸部" />
    );
    expect(screen.getByText('AI 智能草稿')).toBeInTheDocument();
  });
});
