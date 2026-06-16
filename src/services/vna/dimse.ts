import type { AssociationRequest, PresentationContext } from './types';

export interface DimseResponse {
  status: 'success' | 'failure' | 'pending' | 'cancel';
  messageId?: number;
  data?: Record<string, unknown>;
}

export async function dimseCEcho(): Promise<DimseResponse> {
  return { status: 'success', messageId: 1, data: { implementationClassUid: '1.2.840.10008.3.1.1.1', implementationVersionName: 'G005-VNA-v3.0.3.30' } };
}

export async function dimseCFind(level: string, query: Record<string, unknown>): Promise<DimseResponse> {
  const { dicomQuery } = await import('./query');
  const result = await dicomQuery(level, query as any);
  return { status: 'success', data: { results: result.studies, total: result.total } };
}

export async function dimseCMove(studyUid: string, destinationAe: string, priority: number = 0): Promise<DimseResponse> {
  const { dicomMove } = await import('./query');
  return dicomMove(studyUid, destinationAe);
}

export async function dimseCStore(request: { study: any; series: any; instances: any[] }): Promise<DimseResponse> {
  const { vnaStore } = await import('./store');
  const result = await vnaStore.store(request);
  return { status: result.success ? 'success' : 'failure', data: { studyId: result.studyId, errors: result.errors } };
}

export async function negotiateAssociation(request: AssociationRequest): Promise<{ accepted: boolean; acceptedContexts: PresentationContext[]; rejectionReason?: string }> {
  const acceptedContexts = request.presentationContexts.filter(ctx => {
    return ctx.transferSyntaxes.some(ts =>
      ['1.2.840.10008.1.2', '1.2.840.10008.1.2.1', '1.2.840.10008.1.2.4.50', '1.2.840.10008.1.2.4.90'].includes(ts)
    );
  }).map(ctx => ({ ...ctx, result: 0 }));
  return { accepted: acceptedContexts.length > 0, acceptedContexts, rejectionReason: acceptedContexts.length === 0 ? 'No supported transfer syntaxes' : undefined };
}
