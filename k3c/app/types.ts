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

/**
 * Represents an ownership rule that maps resources to an application.
 */
export interface OwnershipRule {
  /**
   * Unique identifier for the ownership rule.
   */
  id: string;

  /**
   * Human-readable name for the rule.
   */
  name: string;

  /**
   * Regex pattern to match against resources or principals.
   */
  regex: string;

  /**
   * The application name this rule is associated with.
   */
  application: string;

  /**
   * The entity type (TOPIC or PRINCIPAL) this rule applies to.
   */
  entityType: 'TOPIC' | 'PRINCIPAL';

  /**
   * The date the rule was created.
   */
  createdAt?: string;
}
