import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';
import costControlService from '~/.server/cost-control/CostControlServiceProvider';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const contexts = await costControlService.getAllContexts();
  return { message: `There are ${contexts.length} contexts` };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <Welcome message={loaderData.message} />;
}
