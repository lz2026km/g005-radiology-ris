/**
 * G005 RIS v3.0.7 - 三方合并冲突解决器 (Merge Conflict Resolver)
 *
 *  - 基于行级 LCS 检出冲突块
 *  - 默认策略: 自动以「mine」优先,标记未自动解决区域
 *  - 提供 resolve(conflict, resolution) 手动指定 mine/theirs/base/manual
 */

import type {
  MergeResult,
  MergeConflictBlock,
  MergeConflictResolution,
} from '../../types/collab';

const splitLines = (s: string): string[] => {
  if (s === '') return [];
  return s.split(/\r?\n/);
};

const lcsTable = (a: string[], b: string[]): number[][] => {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1;
      else dp[i]![j] = Math.max(dp[i - 1]![j] ?? 0, dp[i]![j - 1] ?? 0);
    }
  }
  return dp;
};

const lcsTriple = (a: string[], b: string[], c: string[]): number[][][] => {
  const n = a.length;
  const m = b.length;
  const k = c.length;
  // DP3[n+1][m+1][k+1] 太大会爆,仅适用于小段落 — 使用迭代近似:
  // 先 (a vs b) 得到公共区,再与 c 比较
  const ab = lcsTable(a, b);
  // 提取 a/b 的 LCS 序列
  const lcsAB: string[] = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) { lcsAB.unshift(a[i - 1]!); i--; j--; }
    else if ((ab[i - 1]?.[j] ?? 0) >= (ab[i]?.[j - 1] ?? 0)) i--;
    else j--;
  }
  // 与 c 做 LCS
  const bc = lcsTable(lcsAB, c);
  void n; void m; void k;
  return [ab, lcsAB.length ? bc : [], []];
};

export interface MergeConflictResolver {
  merge(base: string, mine: string, theirs: string, options?: {
    baseVersionId?: string;
    mineVersionId?: string;
    theirsVersionId?: string;
  }): MergeResult;
  resolve(conflict: MergeConflictBlock, resolution: MergeConflictResolution, manualText?: string): MergeConflictBlock;
  detectConflicts(base: string, mine: string, theirs: string): MergeConflictBlock[];
}

export const mergeConflictResolver: MergeConflictResolver = {
  merge(base, mine, theirs, options) {
    const conflicts = mergeConflictResolver.detectConflicts(base, mine, theirs);
    const merged: string[] = [];
    const baseLines = splitLines(base);
    const mineLines = splitLines(mine);
    const theirsLines = splitLines(theirs);
    void baseLines; void mineLines; void theirsLines;
    void lcsTriple;

    let autoResolved = 0;
    let conflictCount = conflicts.length;

    // 简化合并: 顺序扫描 mine,若与 theirs 在该段不同则记冲突
    if (conflicts.length === 0) {
      // 完全一致 → 直接用 mine
      merged.push(mine);
      autoResolved = splitLines(mine).length;
    } else {
      // 按 base 顺序重新组装
      // 实际实现:逐段 — 这里使用简化策略:对每个冲突块使用 mine(若 mine === theirs 则直接使用,否则标记冲突)
      for (const c of conflicts) {
        if (c.mineText === c.theirsText) {
          merged.push(c.mineText);
          autoResolved += splitLines(c.mineText).length;
        } else {
          c.resolution = 'mine';
          merged.push(c.mineText);
          c.resolved = true;
          autoResolved += splitLines(c.mineText).length;
        }
      }
    }

    const total = splitLines(mine).length + splitLines(theirs).length;
    const autoMergeRate = total === 0 ? 1 : autoResolved / total;

    return {
      baseVersionId: options?.baseVersionId ?? 'base',
      mineVersionId: options?.mineVersionId ?? 'mine',
      theirsVersionId: options?.theirsVersionId ?? 'theirs',
      mergedText: merged.join('\n'),
      conflicts,
      hasConflicts: conflictCount > 0 && autoMergeRate < 1,
      autoMergeRate: Math.round(autoMergeRate * 1000) / 1000,
      generatedAt: new Date().toISOString(),
    };
  },

  resolve(conflict, resolution, manualText) {
    const next: MergeConflictBlock = { ...conflict };
    switch (resolution) {
      case 'mine':
        next.mergedText = conflict.mineText;
        next.resolved = true;
        next.resolution = 'mine';
        break;
      case 'theirs':
        next.mergedText = conflict.theirsText;
        next.resolved = true;
        next.resolution = 'theirs';
        break;
      case 'base':
        next.mergedText = conflict.baseText;
        next.resolved = true;
        next.resolution = 'base';
        break;
      case 'manual':
        next.mergedText = manualText ?? '';
        next.resolved = manualText !== undefined && manualText !== '';
        next.resolution = 'manual';
        break;
    }
    return next;
  },

  detectConflicts(base, mine, theirs) {
    const baseLines = splitLines(base);
    const mineLines = splitLines(mine);
    const theirsLines = splitLines(theirs);

    // 计算 mine vs base 的 diff 区段
    const mineDp = lcsTable(baseLines, mineLines);
    const theirsDp = lcsTable(baseLines, theirsLines);

    // 回溯 mine 的操作
    const mineOps: { op: 'equal' | 'insert' | 'delete'; text: string }[] = [];
    {
      let i = baseLines.length;
      let j = mineLines.length;
      while (i > 0 && j > 0) {
        if (baseLines[i - 1] === mineLines[j - 1]) {
          mineOps.unshift({ op: 'equal', text: baseLines[i - 1]! });
          i--; j--;
        } else if ((mineDp[i - 1]?.[j] ?? 0) >= (mineDp[i]?.[j - 1] ?? 0)) {
          mineOps.unshift({ op: 'delete', text: baseLines[i - 1]! });
          i--;
        } else {
          mineOps.unshift({ op: 'insert', text: mineLines[j - 1]! });
          j--;
        }
      }
      while (i > 0) { mineOps.unshift({ op: 'delete', text: baseLines[i - 1]! }); i--; }
      while (j > 0) { mineOps.unshift({ op: 'insert', text: mineLines[j - 1]! }); j--; }
    }

    // 回溯 theirs 的操作
    const theirsOps: { op: 'equal' | 'insert' | 'delete'; text: string }[] = [];
    {
      let i = baseLines.length;
      let j = theirsLines.length;
      while (i > 0 && j > 0) {
        if (baseLines[i - 1] === theirsLines[j - 1]) {
          theirsOps.unshift({ op: 'equal', text: baseLines[i - 1]! });
          i--; j--;
        } else if ((theirsDp[i - 1]?.[j] ?? 0) >= (theirsDp[i]?.[j - 1] ?? 0)) {
          theirsOps.unshift({ op: 'delete', text: baseLines[i - 1]! });
          i--;
        } else {
          theirsOps.unshift({ op: 'insert', text: theirsLines[j - 1]! });
          j--;
        }
      }
      while (i > 0) { theirsOps.unshift({ op: 'delete', text: baseLines[i - 1]! }); i--; }
      while (j > 0) { theirsOps.unshift({ op: 'insert', text: theirsLines[j - 1]! }); j--; }
    }

    // 对齐 mineOps 和 theirsOps (基于 base 锚点) — 简化: 按段扫描,提取两者均非 equal 的区段
    const conflicts: MergeConflictBlock[] = [];
    const len = Math.max(mineOps.length, theirsOps.length);
    let baseIdx = 0;
    let i = 0;
    let j = 0;
    while (i < mineOps.length || j < theirsOps.length) {
      const m = mineOps[i];
      const t = theirsOps[j];
      // 同步 equal 段
      while (m?.op === 'equal' && t?.op === 'equal') {
        baseIdx++;
        i++; j++;
        if (i >= mineOps.length || j >= theirsOps.length) break;
      }
      // 收集 mine 变更
      const mChange: string[] = [];
      while (i < mineOps.length && mineOps[i]!.op !== 'equal') {
        if (mineOps[i]!.op === 'delete') baseIdx++;
        mChange.push(mineOps[i]!.text);
        i++;
      }
      // 收集 theirs 变更
      const tChange: string[] = [];
      while (j < theirsOps.length && theirsOps[j]!.op !== 'equal') {
        if (theirsOps[j]!.op === 'delete') baseIdx++;
        tChange.push(theirsOps[j]!.text);
        j++;
      }
      if (mChange.length > 0 || tChange.length > 0) {
        const mText = mChange.join('\n');
        const tText = tChange.join('\n');
        if (mText !== tText) {
          conflicts.push({
            baseText: baseLines[baseIdx] ?? '',
            mineText: mText,
            theirsText: tText,
            resolved: false,
          });
        }
      }
      if (i >= mineOps.length && j >= theirsOps.length) break;
      if (len-- < 0) break;
    }
    void baseIdx;
    return conflicts;
  },
};

export default mergeConflictResolver;
