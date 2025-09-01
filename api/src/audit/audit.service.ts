import { Injectable, Inject, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './audit-log.entity';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @Inject('REQUEST') private readonly request: Request,
  ) {}

  async log(
    action: AuditAction,
    entityType: string,
    entityId: string,
    userId: string,
    oldValue?: Record<string, any>,
    newValue?: Record<string, any>,
    metadata: Record<string, any> = {},
  ) {
    try {
      const auditLog = new AuditLog();
      auditLog.action = action;
      auditLog.entityType = entityType;
      auditLog.entityId = entityId;
      auditLog.userId = userId;
      auditLog.oldValue = this.sanitizeData(oldValue);
      auditLog.newValue = this.sanitizeData(newValue);
      auditLog.metadata = this.sanitizeData(metadata);
      auditLog.requestId = this.request.headers['x-request-id'] as string;
      auditLog.ipAddress = this.request.ip;
      auditLog.userAgent = this.request.headers['user-agent'];

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Don't throw error if audit logging fails
      console.error('Failed to save audit log:', error);
    }
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveFields = [
      'password',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cardNumber',
      'cvv',
      'expiry',
    ];

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (data !== null && typeof data === 'object') {
      return Object.entries(data).reduce((acc, [key, value]) => {
        const isSensitive = sensitiveFields.some(
          field => field.toLowerCase() === key.toLowerCase()
        );
        
        acc[key] = isSensitive 
          ? '***REDACTED***' 
          : this.sanitizeData(value);
          
        return acc;
      }, {} as Record<string, any>);
    }

    return data;
  }
}
