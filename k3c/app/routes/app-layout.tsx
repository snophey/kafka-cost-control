import type { Route } from './+types/app-layout';
import {
  AppShell,
  Text,
  Group,
  Burger,
  ActionIcon,
  useMantineColorScheme,
  Stack,
  Container,
  Divider,
  Badge,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconSun,
  IconMoon,
  IconLayoutDashboard,
  IconSalad,
  IconCalendarEvent,
  IconFridge,
  IconList,
  IconDashboard,
  IconSparkles,
  IconChartBar,
  IconChartArea,
  IconChartAreaLineFilled,
  IconSettingsCode,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { Outlet } from 'react-router';
import { AuthButtons } from '~/auth/AuthButtons';
import { SidebarNavLink } from '~/components/SidebarNavLink/SidebarNavLink';
import { getUserFromSession } from '~/auth/authUtils.server';

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromSession(request);
  if (user != null) {
    return { currentUser: user };
  }
  return { currentUser: null };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  const [opened, { toggle }] = useDisclosure();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header>
        <Group justify="space-between" h="100%" px="md">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Text size="xl" fw="bold">
              k3c
            </Text>
          </Group>
          <Group gap="sm">
            <ActionIcon
              onClick={() => toggleColorScheme()}
              variant="default"
              size="lg"
              aria-label={
                colorScheme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
            >
              {colorScheme === 'dark' ? (
                <IconSun size={16} />
              ) : (
                <IconMoon size={16} />
              )}
            </ActionIcon>
            <AuthButtons user={loaderData.currentUser} />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        withBorder={false}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          gap: 'var(--mantine-spacing-xs)',
        }}
        display={'flex'}
      >
        <SidebarNavLink
          to="/"
          label="Dashboard"
          icon={<IconChartBar size={16} />}
        />
        <SidebarNavLink
          to="/applications"
          label="Applications"
          icon={<IconSparkles size={16} />}
        />
        <SidebarNavLink
          to="/metrics"
          label="Metrics"
          icon={<IconDashboard size={16} />}
        />
        <SidebarNavLink
          to="/problems"
          label="Problems"
          rightSection={
            <Badge variant={'light'} color={'green'}>
              0
            </Badge>
          }
          icon={<IconAlertTriangle size={16} />}
        />
        <Divider variant={'dashed'} label={'Advanced Settings'} mt={'auto'} />
        <SidebarNavLink
          to="/contexts"
          label="Contexts"
          icon={<IconList size={16} />}
        />
        <SidebarNavLink
          to="/aggregator-setup"
          label="Aggregator Setup"
          icon={<IconSettingsCode size={16} />}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container>
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
