import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'PROPERTY_CREATED'
  | 'PROPERTY_UPDATED'
  | 'PROPERTY_DELETED'
  | 'PREDICTION_CREATED'
  | 'PROPERTY_SAVED'
  | 'PROPERTY_UNSAVED'
  | 'ADMIN_USER_UPDATED'
  | 'ADMIN_USER_DELETED'
  | 'MODEL_STATUS_CHANGED';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    action: {
      type: String,
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTER',
        'PROPERTY_CREATED',
        'PROPERTY_UPDATED',
        'PROPERTY_DELETED',
        'PREDICTION_CREATED',
        'PROPERTY_SAVED',
        'PROPERTY_UNSAVED',
        'ADMIN_USER_UPDATED',
        'ADMIN_USER_DELETED',
        'MODEL_STATUS_CHANGED',
      ],
      required: true,
    },
    resource: { type: String, required: true },
    resourceId: String,
    metadata: { type: Schema.Types.Mixed },
    ipAddress: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
