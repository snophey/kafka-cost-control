import type { Route } from './+types/applications';
import {
  Stack,
  Card,
  Text,
  Group,
  ActionIcon,
  Button,
  Modal,
  TextInput,
  Radio,
  Tooltip,
  Alert,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { Form, useNavigation } from 'react-router';
import { useEffect } from 'react';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import applicationService from '~/.server/applications/ApplicationServiceProvider';
import PageHeader from '~/components/PageHeader/PageHeader';
import type { OwnershipRule } from '~/types';

const OwnershipRuleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  regex: z.string().min(1, 'Regex is required'),
  application: z.string().min(1, 'Application is required'),
  entityType: z.enum(['TOPIC', 'PRINCIPAL']),
});

export async function loader() {
  const rules = await applicationService.getOwnershipRules();
  return { rules };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType');

  if (actionType === 'create') {
    const name = formData.get('name') as string;
    const regex = formData.get('regex') as string;
    const application = formData.get('application') as string;
    const entityType = formData.get('entityType') as 'TOPIC' | 'PRINCIPAL';

    const result = OwnershipRuleSchema.safeParse({
      name,
      regex,
      application,
      entityType,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues.map((e) => e.message).join(', '),
      };
    }

    try {
      await applicationService.createOwnershipRule({
        id: uuidv4(),
        ...result.data,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create rule',
      };
    }
  }

  if (actionType === 'delete') {
    const id = formData.get('id') as string;
    try {
      await applicationService.deleteOwnershipRule(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete rule',
      };
    }
  }

  return { success: false, error: 'Unknown action' };
}

function NewRuleModal({
  opened,
  onClose,
  actionData,
}: {
  opened: boolean;
  onClose: () => void;
  actionData?: { success: boolean; error?: string };
}) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (navigation.state === 'idle' && actionData?.success) {
      onClose();
    }
  }, [navigation.state, actionData, onClose]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Define Ownership Rule"
      centered
    >
      <Form method="post">
        <input type="hidden" name="actionType" value="create" />
        <Stack gap="md">
          {actionData?.error && (
            <Alert color="red" icon={<IconAlertCircle />}>
              {actionData.error}
            </Alert>
          )}
          <TextInput
            label="Rule Name"
            name="name"
            placeholder="e.g. My Team Topics"
            required
          />
          <TextInput
            label="Regex"
            name="regex"
            placeholder="^corp\.team\..*"
            required
          />
          <TextInput
            label="Application"
            name="application"
            placeholder="MyApplication"
            required
          />
          <Radio.Group
            name="entityType"
            label="Apply to"
            defaultValue="TOPIC"
            required
          >
            <Group mt="xs">
              <Radio value="TOPIC" label="Topics" />
              <Radio value="PRINCIPAL" label="Principals" />
            </Group>
          </Radio.Group>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Rule
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
}

function OwnershipRuleCard({ rule }: { rule: OwnershipRule }) {
  const navigation = useNavigation();
  const isDeleting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('id') === rule.id &&
    navigation.formData?.get('actionType') === 'delete';

  return (
    <Card withBorder padding="md" radius="md" shadow="sm">
      <Group justify="space-between" wrap="nowrap">
        <Box style={{ flex: 1 }}>
          <Text fw={700}>{rule.name}</Text>
          <Text size="sm">
            All{' '}
            <Text span fw={600}>
              {rule.entityType === 'TOPIC' ? 'topics' : 'principals'}
            </Text>{' '}
            with name matching{' '}
            <Text span c="blue" style={{ fontFamily: 'monospace' }}>
              {rule.regex}
            </Text>{' '}
            belong to application{' '}
            <Text span fw={600}>
              {rule.application}
            </Text>
          </Text>
        </Box>
        <Form method="post">
          <input type="hidden" name="actionType" value="delete" />
          <input type="hidden" name="id" value={rule.id} />
          <Tooltip label="Delete Rule">
            <ActionIcon
              color="red"
              variant="light"
              type="submit"
              loading={isDeleting}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Form>
      </Group>
    </Card>
  );
}

// Minimal Box substitute if not imported, but let's just use Group/Stack
import { Box } from '@mantine/core';

export default function ApplicationsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Stack gap="md">
      <PageHeader
        title="Applications"
        description={`In k3c, each topic and user (aka principal) is assigned to an application based on some ownership rules. Topics and principals are assigned to applications based on their name. The ownership rules define which patterns belong to which application.
        If your organization consistently follows a naming convention, a single ownership rule can assign each topic or principal to the correct application.
        `}
        rightSection={
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            Add Ownership Rule
          </Button>
        }
      />

      <Stack gap="sm">
        {loaderData.rules.length === 0 ? (
          <Text c="dimmed" fs="italic">
            No ownership rules defined.
          </Text>
        ) : (
          loaderData.rules.map((rule: OwnershipRule) => (
            <OwnershipRuleCard key={rule.id} rule={rule} />
          ))
        )}
      </Stack>

      <NewRuleModal opened={opened} onClose={close} actionData={actionData} />
    </Stack>
  );
}
