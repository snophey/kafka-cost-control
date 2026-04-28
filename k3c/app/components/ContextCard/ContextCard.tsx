import { Card, Text, Group, Badge, Stack } from '@mantine/core';
import type { ContextDataEntity } from '~/.server/cost-control/rest';

interface ContextCardProps {
  context: ContextDataEntity;
  onClick?: (context: ContextDataEntity) => void;
}

export function ContextCard({ context, onClick }: ContextCardProps) {
  const contextCount = context.context
    ? Object.keys(context.context).length
    : 0;

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      onClick={() => onClick?.(context)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text fw={700} size="lg">
            Context: {context.id?.substring(0, 8) || 'Unknown'}
          </Text>
          <Badge color="blue" variant="light">
            {context.entityType}
          </Badge>
        </Group>

        <Text size="sm" c="dimmed">
          <Text span fw={500} c="bright">
            Regex:
          </Text>{' '}
          {context.regex}
        </Text>

        <Text size="sm" c="dimmed">
          <Text span fw={500} c={'bright'}>
            Key-Value Pairs:
          </Text>{' '}
          {contextCount}
        </Text>
      </Stack>
    </Card>
  );
}
