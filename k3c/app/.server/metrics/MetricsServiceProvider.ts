import { costControlService } from '~/.server/cost-control/CostControlServiceProvider';
import { DrizzleMetricsService } from './impl/DrizzleMetricsService';
import type { MetricsService } from './MetricsService';

export const metricsService: MetricsService = new DrizzleMetricsService(
  costControlService,
);

export default metricsService;
