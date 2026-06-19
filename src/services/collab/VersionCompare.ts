/**
 * G005 RIS v3.0.7 - 版本对比 (Version Compare)
 *
 *  - diff(a, b)         计算行级 diff (LCS + Myers-style)
 *  - merge(base, mine, theirs)  三方合并 (调用 MergeConflictResolver)
 *  - similarity(a, b)   文本相似度 (0-100)
 *  - formatHunk(hunk)   渲染为 unified diff 格式
 */

import type {
  CollabVersion,
  VersionDiffResult,
  VersionDiffHunk,
  VersionDiffOp,
  MergeResult,
} from '../../types/collab';
import { mergeConflictResolver } from './MergeConflictResolver';

const splitLines = (s: string): string[] => {
  if (s === '') return [];
  return s.split(/\r?\n/);
};

const tokenize = (s: string): string[] => {
  // 中文按字符切分,英文/数字按单词
  const out: string[] = [];
  const buf: string[] = [];
  for (const ch of s) {
    if (/[\u4e00-\u9fa5]/.test(ch)) {
      if (buf.length > 0) { out.push(buf.join('')); buf.length = 0; }
      out.push(ch);
    } else if (/[a-zA-Z0-9]/.test(ch)) {
      buf.push(ch);
    } else {
      if (buf.length > 0) { out.push(buf.join('')); buf.length = 0; }
      // 标点忽略
    }
  }
  if (buf.length > 0) out.push(buf.join(''));
  return out;
};

// LCS 长度表
const lcsTable = (a: string[], b: string[]): number[][] => {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) {
    const ai = a[i - 1];
    for (let j = 1; j <= m; j++) {
      const bj = b[j - 1];
      if (ai === bj) dp[i]![j] = (dp[i - 1]![j - 1] ?? 0) + 1;
      else dp[i]![j] = Math.max(dp[i - 1]![j] ?? 0, dp[i]![j - 1] ?? 0);
    }
  }
  return dp;
};

export interface DiffOptions {
  /** 行级 vs 字符级 (默认行级) */
  granularity?: 'line' | 'char';
  /** 上下文行数 */
  contextLines?: number;
  /** 是否忽略空白 */
  ignoreWhitespace?: boolean;
}

export interface VersionCompare {
  diff(from: CollabVersion | string, to: CollabVersion | string, options?: DiffOptions): VersionDiffResult;
  merge(base: CollabVersion | string, mine: CollabVersion | string, theirs: CollabVersion | string): MergeResult;
  similarity(a: string, b: string): number;
  formatHunk(hunk: VersionDiffHunk): string;
}

const resolveContent = (v: CollabVersion | string): { id: string; content: string } => {
  if (typeof v === 'string') return { id: 'inline', content: v };
  return { id: v.id, content: v.content };
};

export const versionCompare: VersionCompare = {
  diff(from, to, options) {
    const a = resolveContent(from);
    const b = resolveContent(to);
    const granularity = options?.granularity ?? 'line';
    const linesA = granularity === 'line' ? splitLines(a.content) : tokenize(a.content);
    const linesB = granularity === 'line' ? splitLines(b.content) : tokenize(b.content);
    const dp = lcsTable(linesA, linesB);
    // 回溯生成操作序列
    const ops: { op: VersionDiffOp; text: string }[] = [];
    let i = linesA.length;
    let j = linesB.length;
    while (i > 0 && j > 0) {
      if (linesA[i - 1] === linesB[j - 1]) {
        ops.push({ op: 'equal', text: linesA[i - 1]! });
        i--; j--;
      } else if ((dp[i - 1]?.[j] ?? 0) >= (dp[i]?.[j - 1] ?? 0)) {
        ops.push({ op: 'delete', text: linesA[i - 1]! });
        i--;
      } else {
        ops.push({ op: 'insert', text: linesB[j - 1]! });
        j--;
      }
    }
    while (i > 0) { ops.push({ op: 'delete', text: linesA[i - 1]! }); i--; }
    while (j > 0) { ops.push({ op: 'insert', text: linesB[j - 1]! }); j--; }
    ops.reverse();

    // 合并为 hunk (按 equal 段切割,超过 contextLines 的省略)
    const ctx = options?.contextLines ?? 2;
    const hunks: VersionDiffHunk[] = [];
    let added = 0;
    let removed = 0;
    let k = 0;
    while (k < ops.length) {
      // 跳过过长的 equal
      while (k < ops.length && ops[k]!.op === 'equal') {
        let nextChange = k;
        while (nextChange < ops.length && ops[nextChange]!.op === 'equal') nextChange++;
        const tail = ops.length - nextChange;
        if (nextChange - k > ctx * 2 + 1 && tail > ctx) {
          // 跳过中间 equal
          k = nextChange - ctx;
          break;
        }
        break;
      }
      // 收集 change + 上下文
      const startK = k;
      let oldStart = 0;
      let newStart = 0;
      // 计算当前位置
      let oldLine = 1, newLine = 1;
      for (let p = 0; p < startK; p++) {
        const op = ops[p]!;
        if (op.op === 'equal' || op.op === 'delete') oldLine++;
        if (op.op === 'equal' || op.op === 'insert') newLine++;
      }
      oldStart = oldLine;
      newStart = newLine;
      let oldLines = 0;
      let newLines = 0;
      const lines: string[] = [];
      while (k < ops.length) {
        const op = ops[k]!;
        if (op.op === 'equal') {
          if (oldLines > 0 || newLines > 0) {
            // 已是 change 块,可继续追加上下文直到 ctx
            if (lines.filter((_, idx) => lines[idx]?.startsWith(' ')).length >= ctx) break;
          } else {
            break;
          }
          lines.push(` ${op.text}`);
          oldLines++;
          newLines++;
        } else if (op.op === 'insert') {
          lines.push(`+${op.text}`);
          newLines++;
          added++;
        } else {
          lines.push(`-${op.text}`);
          oldLines++;
          removed++;
        }
        k++;
      }
      if (oldLines > 0 || newLines > 0) {
        hunks.push({
          op: 'replace',
          oldStart,
          oldLines,
          newStart,
          newLines,
          lines,
        });
      }
      if (k === startK) k++; // safety
    }

    const totalA = linesA.length || 1;
    const similarity = Math.max(0, Math.min(100, ((totalA - removed) / totalA) * 100));

    return {
      fromVersionId: a.id,
      toVersionId: b.id,
      changedLines: added + removed,
      addedLines: added,
      removedLines: removed,
      hunks,
      similarity: Math.round(similarity * 10) / 10,
      generatedAt: new Date().toISOString(),
    };
  },

  merge(base, mine, theirs) {
    const b = resolveContent(base);
    const m = resolveContent(mine);
    const t = resolveContent(theirs);
    return mergeConflictResolver.merge(b.content, m.content, t.content, {
      baseVersionId: b.id,
      mineVersionId: m.id,
      theirsVersionId: t.id,
    });
  },

  similarity(a, b) {
    if (a === b) return 100;
    if (!a || !b) return 0;
    const tokA = tokenize(a);
    const tokB = tokenize(b);
    const dp = lcsTable(tokA, tokB);
    const lcs = dp[tokA.length]?.[tokB.length] ?? 0;
    const max = Math.max(tokA.length, tokB.length) || 1;
    return Math.round((lcs / max) * 1000) / 10;
  },

  formatHunk(hunk) {
    const head = `@@ -${hunk.oldStart},${hunk.oldLines} +${hunk.newStart},${hunk.newLines} @@`;
    return [head, ...hunk.lines].join('\n');
  },
};

export default versionCompare;
