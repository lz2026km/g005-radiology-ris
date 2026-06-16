import type { Channel } from '../channels.js';
import { getChannels } from '../channels.js';
import { executePipeline, type PipelineContext } from '../engine.js';
import { getTransforms } from '../transforms.js';

export async function routeMessage(source: string, payload: unknown): Promise<PipelineContext | null> {
  const channels = getChannels().filter(c => c.sourceType === source && c.status === 'started');
  if (channels.length === 0) return null;

  const transforms = getTransforms();
  const channel = channels[0]!;

  const ctx: PipelineContext = {
    channel,
    transforms,
    input: payload,
    errors: []
  };

  return executePipeline(ctx);
}
