import type { Channel } from './channels.js';
import type { Transform } from './transforms.js';
import { executeTransform } from './transforms.js';
import { sendMessage } from './messages.js';

export interface PipelineContext {
  channel: Channel;
  transforms: Transform[];
  input: unknown;
  output?: unknown;
  errors: string[];
}

export async function executePipeline(ctx: PipelineContext): Promise<PipelineContext> {
  let data = ctx.input;

  for (const transform of ctx.channel.transform ? ctx.transforms.filter(t => t.id === ctx.channel.transform) : []) {
    try {
      data = executeTransform(transform.type, data, transform.config);
    } catch (err) {
      ctx.errors.push(`Transform ${transform.id} (${transform.name}): ${(err as Error).message}`);
      break;
    }
  }

  ctx.output = data;
  sendMessage({
    channelId: ctx.channel.id,
    source: `channel:${ctx.channel.name}`,
    payload: ctx.input,
    status: ctx.errors.length === 0 ? 'processed' : 'failed',
    result: data,
    error: ctx.errors.join('; ')
  });

  return ctx;
}
