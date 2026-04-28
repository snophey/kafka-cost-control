import type { OwnershipRule } from '~/types';

export interface ApplicationService {
  /**
   * Returns all ownership info inferred from the CostControlService contexts.
   */
  getOwnershipRules(): Promise<OwnershipRule[]>;

  /**
   * Creates or updates an ownership rule.
   */
  createOwnershipRule(rule: OwnershipRule): Promise<void>;

  /**
   * Deletes an ownership rule.
   */
  deleteOwnershipRule(id: string): Promise<void>;
}
