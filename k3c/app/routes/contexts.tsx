import type { Route } from './+types/contexts';
import {
  SimpleGrid,
  Title,
  Stack,
  Modal,
  Table,
  Text,
  Group,
  Badge,
  Button,
  TextInput,
  Radio,
  ActionIcon,
  Tooltip,
  Alert,
  Tabs,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect } from 'react';
import {
  IconPlus,
  IconTrash,
  IconAlertCircle,
  IconSearch,
} from '@tabler/icons-react';
import { Form, useNavigation } from 'react-router';
import { z } from 'zod';
import costControlService from '~/.server/cost-control/CostControlServiceProvider';
import { ContextCard } from '~/components/ContextCard/ContextCard';
import type { ContextDataEntity } from '~/.server/cost-control/rest';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '~/components/PageHeader/PageHeader';

const ContextSchema = z.object({
  regex: z.string().min(1, 'Regex is required').max(1024, 'Regex too long'),
  entityType: z.enum(['TOPIC', 'PRINCIPAL']),
  context: z
    .record(
      z.string().min(1, 'Key is required').max(1024, 'Key too long'),
      z.string().min(1, 'Value is required').max(1024, 'Value too long'),
    )
    .refine((ctx) => Object.keys(ctx).length > 0, {
      message: 'At least one key-value pair is required',
    }),
});

export async function loader({}: Route.LoaderArgs) {
  const contexts = await costControlService.getAllContexts();
  return { contexts };
}

type ContextTestResponse = {
  success: true;
  ifTopic: { [key: string]: string };
  ifPrincipal: { [key: string]: string };
};

function isContextTestResponse(
  actionData: unknown,
): actionData is ContextTestResponse {
  return (
    typeof actionData === 'object' &&
    actionData !== null &&
    'ifTopic' in actionData &&
    typeof actionData.ifTopic === 'object' &&
    'ifPrincipal' in actionData &&
    typeof actionData.ifPrincipal === 'object'
  );
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('actionType') as string;

  if (actionType === 'create') {
    const regex = formData.get('regex') as string;
    const keys = formData.getAll('key') as string[];
    const values = formData.getAll('value') as string[];
    const entityType = formData.get('entityType') as string;

    const contextMap: { [key: string]: string } = {};
    keys.forEach((key, index) => {
      if (key) {
        contextMap[key] = values[index] || '';
      }
    });

    const result = ContextSchema.safeParse({
      regex,
      entityType,
      context: contextMap,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues.map((e) => e.message).join(', '),
      };
    }

    try {
      await costControlService.saveContext({
        id: uuidv4(),
        entityType: result.data.entityType as any,
        regex: result.data.regex,
        context: result.data.context,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  if (actionType === 'delete') {
    const id = formData.get('id') as string;
    if (!id) {
      return { success: false, error: 'Context ID is required for deletion' };
    }

    try {
      await costControlService.deleteContext(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  if (actionType === 'test') {
    const resourceName = formData.get('resourceName') as string;
    try {
      const results =
        await costControlService.getMatchingContexts(resourceName);
      let topicContext: { [key: string]: string } = {};
      let principalContext: { [key: string]: string } = {};
      for (const result of results) {
        if (result.entityType === 'TOPIC') {
          topicContext = result.context ?? {};
        } else if (result.entityType === 'PRINCIPAL') {
          principalContext = result.context ?? {};
        }
      }
      return {
        success: true,
        ifTopic: topicContext,
        ifPrincipal: principalContext,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  return {
    success: false,
    error: `Unsupported action type: ${actionType}`,
  };
}

interface ContextDetailModalProps {
  opened: boolean;
  onClose: () => void;
  context: ContextDataEntity | null;
  actionData?: { success: boolean; error?: string };
}

function ContextDetailModal({
  opened,
  onClose,
  context,
  actionData,
}: ContextDetailModalProps) {
  const navigation = useNavigation();
  const isDeleting =
    navigation.state === 'submitting' &&
    navigation.formData?.get('actionType') === 'delete';

  // Automatically close modal after successful deletion
  const [wasDeleting, setWasDeleting] = useState(false);
  useEffect(() => {
    if (isDeleting) {
      setWasDeleting(true);
    } else if (
      wasDeleting &&
      navigation.state === 'idle' &&
      actionData?.success
    ) {
      onClose();
      setWasDeleting(false);
    } else if (wasDeleting && navigation.state === 'idle') {
      setWasDeleting(false);
    }
  }, [isDeleting, navigation.state, wasDeleting, onClose, actionData]);

  if (!context) return null;

  const rows = context.context
    ? Object.entries(context.context).map(([key, value]) => (
        <Table.Tr key={key}>
          <Table.Td fw={500}>{key}</Table.Td>
          <Table.Td>{value}</Table.Td>
        </Table.Tr>
      ))
    : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Context Details"
      size="lg"
      centered
    >
      <Stack gap="md">
        {actionData?.error && (
          <Alert
            variant="light"
            color="red"
            title="Error"
            icon={<IconAlertCircle />}
          >
            {actionData.error}
          </Alert>
        )}
        <Group justify="space-between">
          <Group>
            <Text fw={700} size="xl">
              {context.id}
            </Text>
            <Badge color="blue" variant="light" size="lg">
              {context.entityType}
            </Badge>
          </Group>
          <Form method="post">
            <input type="hidden" name="actionType" value="delete" />
            <input type="hidden" name="id" value={context.id} />
            <Tooltip label="Delete Context">
              <ActionIcon
                color="red"
                variant="light"
                type="submit"
                loading={isDeleting}
                size="lg"
              >
                <IconTrash size={20} />
              </ActionIcon>
            </Tooltip>
          </Form>
        </Group>

        <Text>
          <Text span fw={700}>
            Regex:
          </Text>{' '}
          {context.regex}
        </Text>

        <Title order={4} mt="sm">
          Context Data
        </Title>
        <Table withTableBorder withColumnBorders striped>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Key</Table.Th>
              <Table.Th>Value</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Modal>
  );
}

interface ContextTestResultModalProps {
  opened: boolean;
  onClose: () => void;
  testResponse: ContextTestResponse | null;
}

function ContextTestResultModal({
  opened,
  onClose,
  testResponse,
}: ContextTestResultModalProps) {
  if (!testResponse) return null;

  const renderTable = (data: { [key: string]: string }) => {
    const rows = Object.entries(data).map(([key, value]) => (
      <Table.Tr key={key}>
        <Table.Td fw={500}>{key}</Table.Td>
        <Table.Td>{value}</Table.Td>
      </Table.Tr>
    ));

    if (rows.length === 0) {
      return (
        <Text c="dimmed" fs="italic" py="md">
          No context data found.
        </Text>
      );
    }

    return (
      <Table withTableBorder withColumnBorders striped mt="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Key</Table.Th>
            <Table.Th>Value</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Test Context Result"
      size="lg"
      centered
    >
      <Tabs defaultValue="topic">
        <Tabs.List>
          <Tabs.Tab value="topic">Topic Context</Tabs.Tab>
          <Tabs.Tab value="principal">Principal Context</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="topic">
          {renderTable(testResponse.ifTopic)}
        </Tabs.Panel>
        <Tabs.Panel value="principal">
          {renderTable(testResponse.ifPrincipal)}
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
}

interface NewContextModalProps {
  opened: boolean;
  onClose: () => void;
  actionData?: { success: boolean; error?: string };
}

function NewContextModal({
  opened,
  onClose,
  actionData,
}: NewContextModalProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [contextPairs, setContextPairs] = useState([{ id: uuidv4() }]);

  const addPair = () => {
    setContextPairs([...contextPairs, { id: uuidv4() }]);
  };

  const removePair = (id: string) => {
    if (contextPairs.length > 1) {
      setContextPairs(contextPairs.filter((p) => p.id !== id));
    }
  };

  // Reset pairs when modal opens
  useEffect(() => {
    if (opened) {
      setContextPairs([{ id: uuidv4() }]);
    }
  }, [opened]);

  // A better way is to use useEffect to close when state transitions from submitting to idle
  const [wasSubmitting, setWasSubmitting] = useState(false);
  useEffect(() => {
    if (isSubmitting) {
      setWasSubmitting(true);
    } else if (
      wasSubmitting &&
      navigation.state === 'idle' &&
      actionData?.success
    ) {
      onClose();
      setWasSubmitting(false);
    } else if (wasSubmitting && navigation.state === 'idle') {
      setWasSubmitting(false);
    }
  }, [isSubmitting, navigation.state, wasSubmitting, onClose, actionData]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New Context"
      centered
      size="lg"
    >
      <Form method="post">
        <input type="hidden" name="actionType" value="create" />
        <Stack gap="md">
          {actionData?.error && (
            <Alert
              variant="light"
              color="red"
              title="Error"
              icon={<IconAlertCircle />}
            >
              {actionData.error}
            </Alert>
          )}
          <Radio.Group
            name="entityType"
            label="Entity Type"
            defaultValue="TOPIC"
            required
          >
            <Group mt="xs">
              <Radio value="TOPIC" label="TOPIC" />
              <Radio value="PRINCIPAL" label="PRINCIPAL" />
            </Group>
          </Radio.Group>
          <TextInput label="Regex" name="regex" placeholder="(.+)" required />

          <Text fw={500} size="sm">
            Context Data (Key-Value Pairs)
          </Text>

          {contextPairs.map((pair) => (
            <Group key={pair.id} align="flex-end">
              <TextInput
                label="Key"
                name="key"
                placeholder="key"
                required
                style={{ flex: 1 }}
              />
              <TextInput
                label="Value"
                name="value"
                placeholder="value"
                required
                style={{ flex: 1 }}
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => removePair(pair.id)}
                disabled={contextPairs.length <= 1}
                mb={4}
              >
                <IconTrash size={18} />
              </ActionIcon>
            </Group>
          ))}

          <Button
            variant="outline"
            leftSection={<IconPlus size={16} />}
            onClick={addPair}
            size="xs"
            w="fit-content"
          >
            Add Pair
          </Button>

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Submit
            </Button>
          </Group>
        </Stack>
      </Form>
    </Modal>
  );
}

export default function ContextsPage({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { contexts } = loaderData;
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [newContextOpened, { open: openNewContext, close: closeNewContext }] =
    useDisclosure(false);
  const [testResultOpened, { open: openTestResult, close: closeTestResult }] =
    useDisclosure(false);
  const [selectedContext, setSelectedContext] =
    useState<ContextDataEntity | null>(null);
  const [testResponse, setTestResponse] = useState<ContextTestResponse | null>(
    null,
  );

  const handleCardClick = (context: ContextDataEntity) => {
    setSelectedContext(context);
    openDetail();
  };

  useEffect(() => {
    if (isContextTestResponse(actionData)) {
      setTestResponse(actionData);
      openTestResult();
    }
  }, [actionData]);

  return (
    <Stack gap="md">
      <PageHeader
        title="Contexts"
        rightSection={
          <Button leftSection={<IconPlus size={16} />} onClick={openNewContext}>
            New Context
          </Button>
        }
        description={`Context objects assign metadata to different metrics. For example, a context may contain information about the owner of a topic or the related cost-center information. When a metric for a topic or a user comes in, all contexts whose regex matches the topic or principal will be applied.
          Contexts are a low-level Cost Control construct. If you plan to use k3c for cost analysis, you prefer to use the "Applications" feature instead of working with contexts directly.
          `}
      />

      <Form method="post">
        <Group style={{ alignSelf: 'stretch' }} align={'flex-end'} mb={'lg'}>
          <TextInput
            required
            label="Compute Context for Resource"
            placeholder="Resource (topic/principal) name"
            name="resourceName"
            description={
              'Enter the name of a resource to see what its final context will look like.'
            }
            variant={'filled'}
            flex={1}
          />
          <input
            type="hidden"
            name="actionType"
            style={{ display: 'none' }}
            value="test"
          />
          <Button
            type={'submit'}
            variant={'light'}
            leftSection={<IconSearch size={16} />}
            onClick={() => {}}
          >
            Test Context
          </Button>
        </Group>
      </Form>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {contexts.map((context) => (
          <ContextCard
            key={context.id}
            context={context}
            onClick={handleCardClick}
          />
        ))}
      </SimpleGrid>

      <ContextDetailModal
        opened={detailOpened}
        onClose={closeDetail}
        context={selectedContext}
        actionData={actionData}
      />

      <NewContextModal
        opened={newContextOpened}
        onClose={closeNewContext}
        actionData={actionData}
      />

      <ContextTestResultModal
        opened={testResultOpened}
        onClose={closeTestResult}
        testResponse={testResponse}
      />
    </Stack>
  );
}
