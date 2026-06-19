import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@data/reportWritingMock', () => ({
  VOICE_DICTATION_MOCK: null,
}));
vi.mock('@services/writing/writingService', () => ({
  startVoiceDictation: vi.fn(),
  pauseVoiceDictation: vi.fn(),
  resumeVoiceDictation: vi.fn(),
  stopVoiceDictation: vi.fn(),
  getVoiceDictationHistory: vi.fn(),
}));

import { VoiceDictation } from '../VoiceDictation';

describe('VoiceDictation', () => {
  it('renders without crashing', () => {
    const { container } = render(<VoiceDictation reportId="rep-1" />);
    expect(container).toBeTruthy();
  });

  it('renders section selector', () => {
    render(<VoiceDictation reportId="rep-1" />);
    expect(screen.getByText('目标段落')).toBeInTheDocument();
  });
});
