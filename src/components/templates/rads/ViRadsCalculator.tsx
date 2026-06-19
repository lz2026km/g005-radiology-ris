/**
 * VI-RADS 膀胱 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const ViRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="VI-RADS" modality="MR" bodyPart="BLADDER" {...props} />
);
export default ViRadsCalculator;
