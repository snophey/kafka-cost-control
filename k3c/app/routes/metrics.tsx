import type { Route } from './+types/metrics';
import costControlService from '~/.server/cost-control/CostControlServiceProvider';
import logger from '~/.server/logger/LoggerServiceProvider';
import PageHeader from '~/components/PageHeader/PageHeader';
import { SimpleGrid, Card, Stack, Text, Divider } from '@mantine/core';
import type { MetricNameEntity } from '~/.server/cost-control/rest';

export async function loader({}: Route.LoaderArgs) {
  try {
    const metrics = await costControlService.getMetricsNames();
    return {
      success: true,
      metrics: metrics,
    };
  } catch (error) {
    logger.error('Error fetching metrics:', { error });
    return {
      success: false,
      error: 'Failed to fetch metrics',
    };
  }
}

function MetricCard({ metric }: { metric: MetricNameEntity }) {
  const lastSeen = metric.lastSeen ? new Date(metric.lastSeen) : null;
  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="xs" align="flex-start">
        <Text fw={700}>{metric.metricName}</Text>
        <Text size={'sm'} c={'dimmed'} style={{ fontFamily: 'monospace' }}>
          ID: {metric.metricName}
        </Text>
        <Divider style={{ alignSelf: 'stretch' }} my={'xs'} />
        <Text size="xs" c="dimmed" style={{ alignSelf: 'flex-end' }}>
          {lastSeen
            ? `Last observed: ${lastSeen.toLocaleString()}`
            : 'Never observed'}
        </Text>
      </Stack>
    </Card>
  );
}

export default function Metrics({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <PageHeader
        title="Metrics"
        description={`List of metrics that have been observed by the aggregator.
          This is where you can see the last time a metric was observed, and give
          each metric a human-readable name.
          Click on a metric to start editing it.
          `}
      />

      {loaderData.success ? (
        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
          {loaderData.metrics!.map((metric: MetricNameEntity) => (
            <MetricCard key={metric.metricName} metric={metric} />
          ))}
        </SimpleGrid>
      ) : (
        <p>Error fetching metrics: {loaderData.error}</p>
      )}
    </div>
  );
}
