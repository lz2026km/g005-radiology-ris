import type { VnaMetrics } from './types';

const metricsState: VnaMetrics = {
  studiesAdded: 0, studiesQueried: 0, studiesRetrieved: 0,
  instancesStored: 0, instancesRetrieved: 0,
  storageBytesWritten: 0, storageBytesRead: 0,
  averageStoreTimeMs: 0, averageQueryTimeMs: 0, averageRetrieveTimeMs: 0,
  errorCount: 0, activeScpConnections: 0, activeScuConnections: 0,
  timestamp: new Date().toISOString(),
};

let storeTimeTotal = 0;
let storeTimeCount = 0;
let queryTimeTotal = 0;
let queryTimeCount = 0;
let retrieveTimeTotal = 0;
let retrieveTimeCount = 0;

export function recordStore(bytesWritten: number, durationMs: number): void {
  metricsState.studiesAdded++;
  metricsState.instancesStored++;
  metricsState.storageBytesWritten += bytesWritten;
  storeTimeTotal += durationMs;
  storeTimeCount++;
  metricsState.averageStoreTimeMs = storeTimeCount > 0 ? storeTimeTotal / storeTimeCount : 0;
  metricsState.timestamp = new Date().toISOString();
}

export function recordQuery(durationMs: number): void {
  metricsState.studiesQueried++;
  queryTimeTotal += durationMs;
  queryTimeCount++;
  metricsState.averageQueryTimeMs = queryTimeCount > 0 ? queryTimeTotal / queryTimeCount : 0;
  metricsState.timestamp = new Date().toISOString();
}

export function recordRetrieve(bytesRead: number, durationMs: number): void {
  metricsState.studiesRetrieved++;
  metricsState.instancesRetrieved++;
  metricsState.storageBytesRead += bytesRead;
  retrieveTimeTotal += durationMs;
  retrieveTimeCount++;
  metricsState.averageRetrieveTimeMs = retrieveTimeCount > 0 ? retrieveTimeTotal / retrieveTimeCount : 0;
  metricsState.timestamp = new Date().toISOString();
}

export function recordError(): void {
  metricsState.errorCount++;
  metricsState.timestamp = new Date().toISOString();
}

export function recordConnection(type: 'scp' | 'scu', delta: number): void {
  if (type === 'scp') metricsState.activeScpConnections += delta;
  else metricsState.activeScuConnections += delta;
  metricsState.timestamp = new Date().toISOString();
}

export function getVnaMetrics(): VnaMetrics {
  return { ...metricsState };
}

export function resetVnaMetrics(): void {
  metricsState.studiesAdded = 0; metricsState.studiesQueried = 0; metricsState.studiesRetrieved = 0;
  metricsState.instancesStored = 0; metricsState.instancesRetrieved = 0;
  metricsState.storageBytesWritten = 0; metricsState.storageBytesRead = 0;
  metricsState.averageStoreTimeMs = 0; metricsState.averageQueryTimeMs = 0; metricsState.averageRetrieveTimeMs = 0;
  metricsState.errorCount = 0; metricsState.activeScpConnections = 0; metricsState.activeScuConnections = 0;
  metricsState.timestamp = new Date().toISOString();
  storeTimeTotal = 0; storeTimeCount = 0;
  queryTimeTotal = 0; queryTimeCount = 0;
  retrieveTimeTotal = 0; retrieveTimeCount = 0;
}
