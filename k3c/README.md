## How to run locally

Begin by preparing the test instance of Authentik (the oidc provider used for log-in):

```shell
$ tar -xzvf common/authentik/authentik.tar.gz
```

Then run all the dependencies (kcc-aggregator, postgres, authentik, kafka, schema registry):

```shell
$ docker compose --profile=all  --env-file=.env.local up -d
```

This will create an authentik instance with a configured user (test@example.com email and `hunter2` password).
It will also configure some OIDC client credentials for the application (see .env.local for details).

Now generate the kcc-api-client and start the application:

```shell
$ npm install
$ npm run generate-rest-client
$ npm run dev
```

Configuration is read from the `.env.local` file (if present), but you can override this by setting the ENV_FILE environment variable.
Also environment variables can be set directly and will be picked up by the application.
See `config.server.js` for more details on the config loading mechanism and the available configurations.

## How to run tests

```shell
# just once
$ npx playwright install --with-deps firefox
# every time you want to run tests
$ npm run test:e2e
# or if you want to watch the tests run
$ npm run test:e2e:watch
```

# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── server.js
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
