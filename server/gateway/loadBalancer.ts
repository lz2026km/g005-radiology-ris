export interface UpstreamTarget {
  id: string;
  url: string;
  weight: number;
  healthy: boolean;
  activeConnections: number;
  maxConnections: number;
}

type Algorithm = 'round-robin' | 'least-connections' | 'weighted' | 'random';

let targets: UpstreamTarget[] = [];
let algorithm: Algorithm = 'round-robin';
let rrIndex = 0;

export function setTargets(newTargets: UpstreamTarget[]): void {
  targets = newTargets;
}

export function addTarget(target: UpstreamTarget): void {
  targets.push(target);
}

export function removeTarget(id: string): void {
  targets = targets.filter(t => t.id !== id);
}

export function setAlgorithm(algo: Algorithm): void {
  algorithm = algo;
}

export function getNextTarget(): UpstreamTarget | null {
  const healthy = targets.filter(t => t.healthy);
  if (healthy.length === 0) return null;

  switch (algorithm) {
    case 'round-robin': {
      const target = healthy[rrIndex % healthy.length];
      rrIndex++;
      return target;
    }
    case 'least-connections': {
      return healthy.reduce((min, t) => t.activeConnections < min.activeConnections ? t : min);
    }
    case 'weighted': {
      const totalWeight = healthy.reduce((sum, t) => sum + t.weight, 0);
      let random = Math.random() * totalWeight;
      for (const t of healthy) {
        random -= t.weight;
        if (random <= 0) return t;
      }
      return healthy[healthy.length - 1];
    }
    case 'random': {
      return healthy[Math.floor(Math.random() * healthy.length)];
    }
  }
}

export async function forwardRequest(target: UpstreamTarget, req: any, res: any): Promise<void> {
  target.activeConnections++;
  try {
    const response = await fetch(`${target.url}${req.url}`, {
      method: req.method,
      headers: { ...req.headers, host: new URL(target.url).host },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(502).json({ success: false, error: { code: 'UPSTREAM_ERROR', message: `Failed to forward to ${target.url}` } });
    target.healthy = false;
  } finally {
    target.activeConnections--;
  }
}
