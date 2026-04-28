import React from 'react';
import { Group, Title, Text, Divider } from '@mantine/core';
import type { ReactNode } from 'react';
import type { TitleOrder } from '@mantine/core';

interface PageHeaderProps {
  title: string;
  rightSection?: ReactNode;
  description?: string;
  titleOrder?: TitleOrder;
}

export default function PageHeader({
  title,
  rightSection,
  description,
  titleOrder = 2,
}: PageHeaderProps) {
  return (
    <>
      <Group justify="space-between" mb={'md'}>
        <Title order={titleOrder}>{title}</Title>
        {rightSection}
      </Group>

      {description && (
        <Text size="sm" c="dimmed">
          {description}
        </Text>
      )}

      <Divider my={'lg'} />
    </>
  );
}
