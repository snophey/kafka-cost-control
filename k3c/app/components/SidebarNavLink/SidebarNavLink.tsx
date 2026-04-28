import { Badge, NavLink as MantineNavLink, Pill } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';
import classes from './SidebarNavLink.module.css';

interface SidebarNavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
  rightSection?: React.ReactNode;
}

export function SidebarNavLink({
  to,
  label,
  icon,
  rightSection,
}: SidebarNavLinkProps) {
  return (
    <MantineNavLink
      component={RouterNavLink}
      to={to}
      label={label}
      leftSection={icon}
      rightSection={rightSection}
      classNames={{
        root: classes.root,
      }}
    />
  );
}
