export interface VersionedRoute {
  path: string;
  methods: string[];
  minVersion: string;
  maxVersion?: string;
  handler: string;
}

const routes: VersionedRoute[] = [];

export function registerRoute(route: VersionedRoute): void {
  routes.push(route);
}

export function resolveVersion(req: any): string {
  const acceptVersion = req.headers['accept-version'];
  if (acceptVersion) return acceptVersion;
  const urlMatch = req.url.match(/\/v(\d+(?:\.\d+)?)\//);
  return urlMatch ? urlMatch[1] : '1';
}

export function findHandler(version: string, path: string, method: string): VersionedRoute | null {
  const candidates = routes.filter(r => {
    const pathMatch = path.startsWith(r.path);
    const methodMatch = r.methods.includes(method);
    const versionGE = compareVersions(version, r.minVersion) >= 0;
    const versionLE = r.maxVersion ? compareVersions(version, r.maxVersion) <= 0 : true;
    return pathMatch && methodMatch && versionGE && versionLE;
  });
  return candidates.sort((a, b) => compareVersions(b.minVersion, a.minVersion))[0] || null;
}

export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  const len = Math.max(parts1.length, parts2.length);
  for (let i = 0; i < len; i++) {
    const a = parts1[i] || 0;
    const b = parts2[i] || 0;
    if (a > b) return 1;
    if (a < b) return -1;
  }
  return 0;
}

export function apiVersioning() {
  return (req: any, res: any, next: () => void) => {
    const version = resolveVersion(req);
    req.apiVersion = version;
    next();
  };
}
