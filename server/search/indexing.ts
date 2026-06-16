import type { SearchDocument, SearchIndexType } from './engine';

interface IndexingQueueItem {
  id: string;
  type: SearchIndexType;
  action: 'index' | 'update' | 'delete';
  data: Record<string, unknown>;
  priority: number;
}

const queue: IndexingQueueItem[] = [];
let isProcessing = false;

export const indexingService = {
  async enqueue(item: Omit<IndexingQueueItem, 'id'>): Promise<string> {
    const id = `idx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    queue.push({ ...item, id });
    return id;
  },

  async processQueue(): Promise<number> {
    if (isProcessing) return 0;
    isProcessing = true;
    const batch = queue.splice(0, 50).sort((a, b) => b.priority - a.priority);
    const { searchEngine } = await import('./engine');
    for (const item of batch) {
      if (item.action === 'delete') {
        await searchEngine.delete(item.id);
      } else {
        const doc: SearchDocument = {
          id: item.data.id as string || item.id,
          type: item.type as SearchIndexType,
          title: item.data.title as string || '',
          content: item.data.content as string || '',
          tags: item.data.tags as string[] || [],
          metadata: item.data,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await searchEngine.index(doc);
      }
    }
    isProcessing = false;
    return batch.length;
  },

  getQueueSize(): number {
    return queue.length;
  },

  async reindexAll(entities: Record<string, unknown>[], type: SearchIndexType): Promise<number> {
    const { searchEngine } = await import('./engine');
    const docs: SearchDocument[] = entities.map(e => ({
      id: e.id as string,
      type,
      title: (e.patientName || e.name || e.id) as string,
      content: JSON.stringify(e),
      tags: [],
      metadata: e,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    return searchEngine.bulkIndex(docs);
  },
};
