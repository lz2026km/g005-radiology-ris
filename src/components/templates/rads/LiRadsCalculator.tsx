/**
 * LI-RADS 肝脏 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const LiRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="LI-RADS" modality="MR" bodyPart="LIVER" {...props} />
);
export default LiRadsCalculator;
