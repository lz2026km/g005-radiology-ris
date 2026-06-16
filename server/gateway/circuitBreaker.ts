type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitConfig {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
}

interface CircuitStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
  state: CircuitState;
}

const circuits = new Map<string, CircuitStats>();
const configs = new Map<string, CircuitConfig>();

const DEFAULT_CONFIG: CircuitConfig = { failureThreshold: 5, successThreshold: 3, timeoutMs: 30000 };

export function registerCircuit(name: string, config?: Partial<CircuitConfig>): void {
  configs.set(name, { ...DEFAULT_CONFIG, ...config });
  circuits.set(name, { failures: 0, successes: 0, lastFailureTime: 0, state: 'closed' });
}

export function getCircuitState(name: string): CircuitState {
  const circuit = circuits.get(name);
  const config = configs.get(name) || DEFAULT_CONFIG;
  if (!circuit) return 'closed';
  if (circuit.state === 'open' && Date.now() - circuit.lastFailureTime > config.timeoutMs) {
    circuit.state = 'half-open';
  }
  return circuit.state;
}

export function recordSuccess(name: string): void {
  const circuit = circuits.get(name);
  if (!circuit) return;
  circuit.successes++;
  circuit.failures = 0;
  if (circuit.state === 'half-open' && circuit.successes >= (configs.get(name) || DEFAULT_CONFIG).successThreshold) {
    circuit.state = 'closed';
    circuit.failures = 0;
    circuit.successes = 0;
  }
}

export function recordFailure(name: string): void {
  const circuit = circuits.get(name);
  if (!circuit) return;
  circuit.failures++;
  circuit.lastFailureTime = Date.now();
  const config = configs.get(name) || DEFAULT_CONFIG;
  if (circuit.failures >= config.failureThreshold) {
    circuit.state = 'open';
  }
}

export function circuitBreaker(name: string) {
  return (req: any, res: any, next: () => void) => {
    const state = getCircuitState(name);
    if (state === 'open') {
      return res.status(503).json({ success: false, error: { code: 'CIRCUIT_OPEN', message: `Circuit breaker open for ${name}` } });
    }
    const originalEnd = res.end.bind(res);
    res.end = function (...args: any[]) {
      if (res.statusCode >= 500) {
        recordFailure(name);
      } else {
        recordSuccess(name);
      }
      return originalEnd(...args);
    };
    next();
  };
}
