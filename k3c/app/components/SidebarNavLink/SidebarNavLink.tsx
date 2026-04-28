import { NavLink as MantineNavLink } from '@mantine/core';
import { NavLink as RouterNavLink } from 'react-router';
import classes from './SidebarNavLink.module.css';

interface SidebarNavLinkProps {
  to: string;
  label: string;
  icon?: React.ReactNode;
}

export function SidebarNavLink({ to, label, icon }: SidebarNavLinkProps) {
  return (
    <MantineNavLink
      component={RouterNavLink}
      to={to}
      label={label}
      leftSection={icon}
      classNames={{
        root: classes.root,
      }}
    />
  );
}
