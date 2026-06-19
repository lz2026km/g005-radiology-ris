/**
 * C-RADS 结肠 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const CRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="C-RADS" modality="CT" bodyPart="COLON" {...props} />
);
export default CRadsCalculator;
