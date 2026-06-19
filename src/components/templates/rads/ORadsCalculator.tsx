/**
 * O-RADS 卵巢 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const ORadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="O-RADS" modality="US" bodyPart="OVARY" {...props} />
);
export default ORadsCalculator;
