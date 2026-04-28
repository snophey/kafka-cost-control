import type { ApplicationService } from '../ApplicationService';
import type { OwnershipRule } from '~/types';
import type { CostControlService } from '~/.server/cost-control/CostControlService';

export class ContextApplicationService implements ApplicationService {
  constructor(private costControlService: CostControlService) {}

  async getOwnershipRules(): Promise<OwnershipRule[]> {
    const contexts = await this.costControlService.getAllContexts();

    // Inferred rules: any context that has an "application" key
    return contexts
      .filter((c) => c.context?.application)
      .map(
        (c) =>
          ({
            id: c.id || '',
            name: `Rule for ${c.context?.application}`,
            regex: c.regex ?? '',
            application: c.context!.application,
            entityType: c.entityType === 'TOPIC' ? 'TOPIC' : 'PRINCIPAL',
          }) satisfies OwnershipRule,
      );
  }

  async createOwnershipRule(rule: OwnershipRule): Promise<void> {
    await this.costControlService.saveContext({
      id: rule.id,
      validFrom: new Date(),
      entityType: rule.entityType,
      regex: rule.regex,
      context: {
        application: rule.application,
      },
    });
  }

  async deleteOwnershipRule(id: string): Promise<void> {
    await this.costControlService.deleteContext(id);
  }
}
