import { costControlService } from '~/.server/cost-control/CostControlServiceProvider';
import { ContextApplicationService } from './impl/ContextApplicationService';
import type { ApplicationService } from './ApplicationService';

export const applicationService: ApplicationService =
  new ContextApplicationService(costControlService);

export default applicationService;
