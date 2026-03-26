import type { BaseModel } from './base-model';

/** Base auditable entity (created/updated by and dates). */
export interface BaseAuditableModel extends BaseModel {
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
