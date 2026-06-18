/**
 * G005 放射RIS系统 v3.0.6.1 - 优先级排序引擎
 */
import { ScoreCalculator } from './ScoreCalculator'
import type { SmartWorklistItem } from './Worklist'

export class PriorityEngine {
  private version = 'v3.0.6.1'

  compute(item: SmartWorklistItem): number {
    return ScoreCalculator.compute(item).total
  }

  breakdown(item: SmartWorklistItem) {
    return ScoreCalculator.compute(item)
  }

  sort(items: SmartWorklistItem[]): SmartWorklistItem[] {
    return [...items].sort((a, b) => this.compute(b) - this.compute(a))
  }

  getVersion(): string {
    return this.version
  }
}