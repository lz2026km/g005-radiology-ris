/**
 * Bone-RADS 偶发骨病灶 RADS 计算器
 */
import React from 'react';
import { RadsCalculator } from './RadsCalculator';
import type { RadsCalculatorResult } from '@/types/templates/calculations';

interface Props {
  onCommit?: (result: RadsCalculatorResult) => void;
  compact?: boolean;
}

export const BoneRadsCalculator: React.FC<Props> = (props) => (
  <RadsCalculator initialSystem="Bone-RADS" modality="CT" bodyPart="BONE" {...props} />
);
export default BoneRadsCalculator;
