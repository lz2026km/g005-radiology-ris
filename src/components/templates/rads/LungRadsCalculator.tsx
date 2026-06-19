/**
 * Lung-RADS 肺结节 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const LungRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="Lung-RADS" modality="CT" bodyPart="CHEST" {...props} />
);
export default LungRadsCalculator;
