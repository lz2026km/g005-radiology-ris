/**
 * BI-RADS 乳腺 RADS 计算器 - 简化版
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const BiRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="BI-RADS" modality="MG" bodyPart="BREAST" {...props} />
);
export default BiRadsCalculator;
