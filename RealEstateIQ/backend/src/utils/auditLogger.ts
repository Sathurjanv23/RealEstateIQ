import { AuditLog, AuditAction } from '../models/AuditLog';
import { logger } from './logger';

interface AuditOptions {
  userId?: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | string[];
}

/**
 * Create an audit log entry. Failures are logged but do not throw.
 */
export async function audit(options: AuditOptions): Promise<void> {
  try {
    await AuditLog.create({
      userId: options.userId || null,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId,
      metadata: options.metadata,
      ipAddress: options.ipAddress,
    });
  } catch (err) {
    logger.error('Failed to write audit log:', err);
  }
}
