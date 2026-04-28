import { inArray } from 'drizzle-orm';
import type { MetricsService } from '../MetricsService';
import type { RichMetric } from '~/types';
import type { CostControlService } from '~/.server/cost-control/CostControlService';
import { db } from '~/.server/db/DatabaseConnectionProvider';
import { metricsTable } from '~/.server/db/schema';

export class DrizzleMetricsService implements MetricsService {
  constructor(private costControlService: CostControlService) {}

  async getRichMetricsInfo(): Promise<RichMetric[]> {
    const rawMetrics = await this.costControlService.getMetricsNames();

    if (rawMetrics.length === 0) {
      return [];
    }

    const technicalNames = rawMetrics
      .map((m) => m.metricName)
      .filter((name): name is string => !!name);

    if (technicalNames.length === 0) {
      return rawMetrics.map((m) => ({
        technicalName: m.metricName || 'unknown',
        aggregationType: m.aggregationType,
        lastSeen: m.lastSeen,
      }));
    }

    const dbMetrics = await db
      .select()
      .from(metricsTable)
      .where(inArray(metricsTable.id, technicalNames));

    const dbMetricsMap = new Map(dbMetrics.map((m) => [m.id, m]));

    return rawMetrics.map((m): RichMetric => {
      const technicalName = m.metricName || 'unknown';
      const dbEntry = dbMetricsMap.get(technicalName);

      return {
        technicalName,
        name: dbEntry?.name,
        description: dbEntry?.description ?? undefined,
        aggregationType: m.aggregationType,
        lastSeen: m.lastSeen,
      };
    });
  }

  async setMetricMetadata(
    technicalName: string,
    name: string,
    description: string,
  ): Promise<void> {
    await db
      .insert(metricsTable)
      .values({
        id: technicalName,
        name,
        description,
      })
      .onConflictDoUpdate({
        target: metricsTable.id,
        set: {
          name,
          description,
        },
      });
  }
}
