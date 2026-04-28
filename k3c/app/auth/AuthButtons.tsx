import { Button } from '@mantine/core';
import { Form, Link } from 'react-router';
import type { User } from '~/.server/auth/AuthenticatorProvider';

type AuthButtonsProps = {
  user: User | null;
};

export function AuthButtons({ user }: AuthButtonsProps) {
  if (user == null) {
    return (
      <>
        <Button variant="outline" component={Link} to="/" reloadDocument>
          Register
        </Button>
        <Form method="POST" action="/oauth/login">
          <Button type="submit">Login</Button>
        </Form>
      </>
    );
  }

  return (
    <Button component={Link} to="/oauth/logout" reloadDocument>
      Logout
    </Button>
  );
}
