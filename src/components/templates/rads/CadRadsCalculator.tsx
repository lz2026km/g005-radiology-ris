/**
 * CAD-RADS 冠脉 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const CadRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="CAD-RADS" modality="CT" bodyPart="HEART" {...props} />
);
export default CadRadsCalculator;
