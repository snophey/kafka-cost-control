import type { Route } from './+types/metrics';
import metricsService from '~/.server/metrics/MetricsServiceProvider';
import logger from '~/.server/logger/LoggerServiceProvider';
import PageHeader from '~/components/PageHeader/PageHeader';
import {
  SimpleGrid,
  Card,
  Stack,
  Text,
  Divider,
  Badge,
  Modal,
  TextInput,
  Textarea,
  Group,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import { Form, useNavigation } from 'react-router';
import { z } from 'zod';
import type { RichMetric } from '~/types';

const MetricMetadataSchema = z.object({
  technicalName: z.string().min(1),
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const technicalName = formData.get('technicalName') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;

  const result = MetricMetadataSchema.safeParse({
    technicalName,
    name,
    description,
  });

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues.map((e) => e.message).join(', '),
    };
  }

  try {
    await metricsService.setMetricMetadata(
      result.data.technicalName,
      result.data.name,
      result.data.description,
    );
    return { success: true };
  } catch (error) {
    logger.error('Error updating metric metadata:', { error });
    return {
      success: false,
      error: 'Failed to update metric metadata',
    };
  }
}

export async function loader({}: Route.LoaderArgs) {
  try {
    const metrics = await metricsService.getRichMetricsInfo();
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

function MetricEditModal({
  opened,
  onClose,
  metric,
  actionData,
}: {
  opened: boolean;
  onClose: () => void;
  metric: RichMetric | null;
  actionData?: { success: boolean; error?: string };
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (navigation.state === 'idle' && actionData?.success) {
      onClose();
    }
  }, [navigation.state, actionData, onClose]);

  if (!metric) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Metric Metadata"
      centered
    >
      <Form method="post">
        <input
          type="hidden"
          name="technicalName"
          value={metric.technicalName}
        />
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Technical Name: <b>{metric.technicalName}</b>
          </Text>

          <TextInput
            label="Name"
            name="name"
            placeholder="Metric Display Name"
            defaultValue={metric.name || ''}
            required
            data-autofocus
          />

          <Textarea
            label="Description"
            name="description"
            placeholder="A short description of what this metric represents"
            defaultValue={metric.description || ''}
            autosize
            minRows={3}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
}

function MetricCard({
  metric,
  onClick,
}: {
  metric: RichMetric;
  onClick: (metric: RichMetric) => void;
}) {
  const lastSeen = metric.lastSeen ? new Date(metric.lastSeen) : null;
  return (
    <Card
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      onClick={() => onClick(metric)}
      style={{ cursor: 'pointer' }}
    >
      <Stack gap="xs" align="flex-start">
        <Stack gap={0}>
          <Text fw={700}>{metric.name || metric.technicalName}</Text>
          {metric.name && (
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              Technical Name: {metric.technicalName}
            </Text>
          )}
        </Stack>

        {metric.description && (
          <Text size="sm" mt="xs">
            {metric.description}
          </Text>
        )}

        <Badge size="xs" variant="light" color="blue">
          {metric.aggregationType || 'SUM'}
        </Badge>

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

export default function Metrics({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMetric, setSelectedMetric] = useState<RichMetric | null>(null);

  const handleCardClick = (metric: RichMetric) => {
    setSelectedMetric(metric);
    open();
  };

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
          {loaderData.metrics!.map((metric: RichMetric) => (
            <MetricCard
              key={metric.technicalName}
              metric={metric}
              onClick={handleCardClick}
            />
          ))}
        </SimpleGrid>
      ) : (
        <p>Error fetching metrics: {loaderData.error}</p>
      )}

      <MetricEditModal
        opened={opened}
        onClose={close}
        metric={selectedMetric}
        actionData={actionData}
      />
    </div>
  );
}
