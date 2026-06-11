/**
 * Audit Logging System
 * G005 Radiology RIS System
 * S8: Audit logs for CRUD operations
 */
import { v4 as uuidv4 } from 'uuid';
import { 
  AuditAction, 
  AuditEntityType, 
  AuditLog, 
  User, 
  UserRole 
} from '../types';

// In-memory audit log storage (in production, this would be sent to a backend)
let auditLogs: AuditLog[] = [];

// Maximum logs to keep in memory
const MAX_LOGS = 10000;

/**
 * Create audit log entry
 */
export function createAuditLog(params: {
  userId: string;
  userName: string;
  userRole: UserRole;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityName?: string;
  details?: Record<string, unknown>;
  success?: boolean;
  errorMessage?: string;
}): AuditLog {
  const log: AuditLog = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    entityName: params.entityName,
    details: params.details,
    ipAddress: getClientIP(),
    userAgent: getClientUserAgent(),
    success: params.success !== false,
    errorMessage: params.errorMessage,
  };

  // Add to memory
  auditLogs.push(log);
  
  // Trim if over limit
  if (auditLogs.length > MAX_LOGS) {
    auditLogs = auditLogs.slice(-MAX_LOGS);
  }

  // In production, also send to backend
  sendToBackend(log);

  return log;
}

/**
 * Log patient operation
 */
export function logPatientOperation(
  action: 'create' | 'read' | 'update' | 'delete',
  user: User,
  patientId: string,
  patientName?: string,
  details?: Record<string, unknown>
): AuditLog {
  return createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'patient',
    entityId: patientId,
    entityName: patientName,
    details,
  });
}

/**
 * Log exam operation
 */
export function logExamOperation(
  action: 'create' | 'read' | 'update' | 'delete' | 'submit',
  user: User,
  examId: string,
  examName?: string,
  details?: Record<string, unknown>
): AuditLog {
  return createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'exam',
    entityId: examId,
    entityName: examName,
    details,
  });
}

/**
 * Log report operation
 */
export function logReportOperation(
  action: 'create' | 'sign_report' | 'audit_report' | 'publish_report' | 'update' | 'delete',
  user: User,
  reportId: string,
  reportName?: string,
  details?: Record<string, unknown>
): AuditLog {
  return createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'report',
    entityId: reportId,
    entityName: reportName,
    details,
  });
}

/**
 * Log login/logout
 */
export function logAuthOperation(
  action: 'login' | 'logout' | 'refresh_token',
  user: User,
  success = true,
  errorMessage?: string
): AuditLog {
  return createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'user',
    entityId: user.id,
    entityName: user.name,
    success,
    errorMessage,
  });
}

/**
 * Log print operation
 */
export function logPrintOperation(
  action: 'print' | 'cancel_print' | 'reprint',
  user: User,
  printJobId: string,
  details?: Record<string, unknown>
): AuditLog {
  return createAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    entityType: 'print_job',
    entityId: printJobId,
    details,
  });
}

/**
 * Query audit logs with filters
 */
export function queryAuditLogs(filters: {
  userId?: string;
  userRole?: UserRole;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}): AuditLog[] {
  let results = [...auditLogs];

  if (filters.userId) {
    results = results.filter(log => log.userId === filters.userId);
  }
  if (filters.userRole) {
    results = results.filter(log => log.userRole === filters.userRole);
  }
  if (filters.action) {
    results = results.filter(log => log.action === filters.action);
  }
  if (filters.entityType) {
    results = results.filter(log => log.entityType === filters.entityType);
  }
  if (filters.entityId) {
    results = results.filter(log => log.entityId === filters.entityId);
  }
  if (filters.startDate) {
    results = results.filter(log => log.timestamp >= filters.startDate!);
  }
  if (filters.endDate) {
    results = results.filter(log => log.timestamp <= filters.endDate!);
  }
  if (filters.success !== undefined) {
    results = results.filter(log => log.success === filters.success);
  }

  // Sort by timestamp descending (newest first)
  results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Apply pagination
  const offset = filters.offset || 0;
  const limit = filters.limit || 100;
  
  return results.slice(offset, offset + limit);
}

/**
 * Get audit log by ID
 */
export function getAuditLogById(id: string): AuditLog | undefined {
  return auditLogs.find(log => log.id === id);
}

/**
 * Export audit logs (for compliance)
 */
export function exportAuditLogs(filters: {
  startDate: string;
  endDate: string;
  format?: 'json' | 'csv';
}): string {
  const logs = queryAuditLogs({
    startDate: filters.startDate,
    endDate: filters.endDate,
    limit: MAX_LOGS,
  });

  if (filters.format === 'csv') {
    return exportToCsv(logs);
  }

  return JSON.stringify(logs, null, 2);
}

/**
 * Export to CSV format
 */
function exportToCsv(logs: AuditLog[]): string {
  const headers = [
    'ID', 'Timestamp', 'User ID', 'User Name', 'User Role',
    'Action', 'Entity Type', 'Entity ID', 'Entity Name',
    'Success', 'Error Message', 'IP Address', 'User Agent',
  ];

  const rows = logs.map(log => [
    log.id,
    log.timestamp,
    log.userId,
    log.userName,
    log.userRole,
    log.action,
    log.entityType,
    log.entityId,
    log.entityName || '',
    log.success ? 'Yes' : 'No',
    log.errorMessage || '',
    log.ipAddress || '',
    log.userAgent || '',
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');
}

/**
 * Get client IP address
 */
function getClientIP(): string | undefined {
  // In production with backend, this would be captured server-side
  return undefined;
}

/**
 * Get client user agent
 */
function getClientUserAgent(): string | undefined {
  if (typeof window !== 'undefined') {
    return window.navigator.userAgent;
  }
  return undefined;
}

/**
 * Send log to backend (async, non-blocking)
 */
const API_BASE = (typeof window !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || '/api'

function sendToBackend(log: AuditLog): void {
  fetch(`${API_BASE}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: log.action,
      resource: log.entityType,
      resourceId: log.entityId,
      detail: log.details,
      success: log.success,
    }),
  }).catch(() => { /* silent */ })
}

/**
 * Clear all logs (admin function)
 */
export function clearAuditLogs(): void {
  auditLogs = [];
}

/**
 * Get log statistics
 */
export function getAuditStats(startDate?: string, endDate?: string): {
  total: number;
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byUser: Record<string, number>;
  successRate: number;
} {
  const logs = queryAuditLogs({
    startDate,
    endDate,
    limit: MAX_LOGS,
  });

  const stats = {
    total: logs.length,
    byAction: {} as Record<string, number>,
    byEntityType: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    successRate: 0,
  };

  let successCount = 0;

  for (const log of logs) {
    stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
    stats.byEntityType[log.entityType] = (stats.byEntityType[log.entityType] || 0) + 1;
    stats.byUser[log.userName] = (stats.byUser[log.userName] || 0) + 1;
    if (log.success) successCount++;
  }

  stats.successRate = logs.length > 0 ? (successCount / logs.length) * 100 : 0;

  return stats;
}