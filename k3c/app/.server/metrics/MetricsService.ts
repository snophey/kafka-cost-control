import type { RichMetric } from '~/types';

export interface MetricsService {
  /**
   * Returns the metrics known to the system, optionally enriched with additional info
   * from the local database.
   *
   * A RichMetric contains a combination of information returned by the cost control service
   * and the columns in the local metrics table.
   * The 'metricName' from the cost control service corresponds to the 'technical_name' column
   * in the local database.
   */
  getRichMetricsInfo(): Promise<RichMetric[]>;

  /**
   * Upserts metadata for a given metric
   *
   * @param technicalName The technical name of the metric (database ID)
   * @param name The human-readable name for the metric
   * @param description A detailed description of the metric
   */
  setMetricMetadata(
    technicalName: string,
    name: string,
    description: string,
  ): Promise<void>;
}
