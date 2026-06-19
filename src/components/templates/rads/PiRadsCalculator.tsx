/**
 * PI-RADS 前列腺 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const PiRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="PI-RADS" modality="MR" bodyPart="PROSTATE" {...props} />
);
export default PiRadsCalculator;
