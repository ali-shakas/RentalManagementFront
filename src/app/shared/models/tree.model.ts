import type { BaseModel } from './base/base-model';

/**
 * نموذج عقدة شجرية (للقوائم ذات المستويات).
 * مطابق للدليل: shared/models/tree.model.ts
 */
export interface TreeNode<T = unknown> extends BaseModel {
  label?: string;
  children?: TreeNode<T>[];
  data?: T;
  expanded?: boolean;
}
