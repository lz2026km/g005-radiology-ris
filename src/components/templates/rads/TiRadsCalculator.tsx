/**
 * TI-RADS 甲状腺 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const TiRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="TI-RADS" modality="US" bodyPart="THYROID" {...props} />
);
export default TiRadsCalculator;
