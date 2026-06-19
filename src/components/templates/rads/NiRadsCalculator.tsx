/**
 * NI-RADS 头颈 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const NiRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="NI-RADS" modality="MR" bodyPart="NECK" {...props} />
);
export default NiRadsCalculator;
