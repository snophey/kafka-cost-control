// This is where we define DTOs that cross the server-client boundary

/**
 * Represents a metric with both technical information from the cost control service
 * and descriptive information from our local database.
 */
export interface RichMetric {
  /**
   * The technical name of the metric (acts as the primary key).
   * Corresponds to the 'metricName' from cost control service and 'id' in the local DB.
   */
  technicalName: string;

  /**
   * Human-readable name of the metric.
   */
  name?: string;

  /**
   * Detailed description of what the metric represents.
   */
  description?: string;

  /**
   * The aggregation type (e.g., SUM, MAX).
   */
  aggregationType?: string;

  /**
   * When the metric was last observed by the system.
   */
  lastSeen?: Date;
}
