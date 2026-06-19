/**
 * G005 RIS v3.0.6.6 - 工作流执行器
 * 60 点升级 - 基于事件的轻量级工作流执行器
 */

import type {
  WorkflowGraph,
  WorkflowExecutionContext,
  WorkflowExecutionStep,
  WorkflowNode,
} from '../../../types/workflow';
import { evaluateCondition } from './WorkflowModel';

export interface ExecuteOptions {
  instanceId?: string;
  variables?: Record<string, unknown>;
  onStep?: (step: WorkflowExecutionStep, node: WorkflowNode) => void;
  onNodeEnter?: (node: WorkflowNode) => Promise<void> | void;
}

export class WorkflowExecutor {
  private graph: WorkflowGraph;

  constructor(graph: WorkflowGraph) {
    this.graph = graph;
  }

  getGraph(): WorkflowGraph {
    return this.graph;
  }

  setGraph(graph: WorkflowGraph): void {
    this.graph = graph;
  }

  async execute(options: ExecuteOptions = {}): Promise<WorkflowExecutionContext> {
    const startNode = this.graph.nodes.find((n) => n.kind === 'start');
    if (!startNode) {
      throw new Error('工作流缺少开始节点,无法执行');
    }
    const ctx: WorkflowExecutionContext = {
      workflowId: this.graph.id,
      instanceId: options.instanceId ?? `inst_${Date.now().toString(36)}`,
      currentNodeId: startNode.id,
      variables: { ...(this.graph.variables ?? {}), ...(options.variables ?? {}) },
      history: [],
      status: 'running',
      startedAt: new Date().toISOString(),
    };

    let cursor: WorkflowNode | undefined = startNode;
    let safetyCounter = 0;
    const maxSteps = Math.max(64, this.graph.nodes.length * 4);

    while (cursor) {
      if (safetyCounter++ > maxSteps) {
        ctx.status = 'failed';
        throw new Error('工作流执行超过最大步数,可能存在循环');
      }

      const enteredAt = new Date().toISOString();
      if (options.onNodeEnter) await options.onNodeEnter(cursor);

      const step: WorkflowExecutionStep = {
        nodeId: cursor.id,
        enteredAt,
      };

      ctx.currentNodeId = cursor.id;
      ctx.history.push(step);
      if (options.onStep) options.onStep(step, cursor);

      if (cursor.kind === 'end') {
        step.exitedAt = new Date().toISOString();
        step.outcome = 'success';
        ctx.status = 'completed';
        ctx.completedAt = step.exitedAt;
        return ctx;
      }

      const outgoing = this.graph.edges
        .filter((e) => e.source === cursor!.id)
        .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));

      let nextNode: WorkflowNode | undefined;
      for (const edge of outgoing) {
        if (edge.kind === 'conditional' || edge.kind === 'default') {
          const pass = edge.kind === 'default' || evaluateCondition(edge.condition, ctx.variables);
          if (pass) {
            nextNode = this.graph.nodes.find((n) => n.id === edge.target);
            break;
          }
        } else if (edge.kind === 'sequence' || edge.kind === 'error') {
          nextNode = this.graph.nodes.find((n) => n.id === edge.target);
          break;
        }
      }

      step.exitedAt = new Date().toISOString();
      step.outcome = nextNode ? 'success' : 'skipped';
      cursor = nextNode;
    }

    ctx.status = 'completed';
    ctx.completedAt = new Date().toISOString();
    return ctx;
  }

  resume(ctx: WorkflowExecutionContext): WorkflowExecutionContext {
    const clone = { ...ctx, variables: { ...ctx.variables } };
    clone.status = 'running';
    return clone;
  }

  pause(ctx: WorkflowExecutionContext): WorkflowExecutionContext {
    return { ...ctx, status: 'paused' };
  }

  cancel(ctx: WorkflowExecutionContext): WorkflowExecutionContext {
    return { ...ctx, status: 'failed', completedAt: new Date().toISOString() };
  }
}