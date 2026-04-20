![Venture Logo](./client/public/venture-logo.svg#gh-light-mode-only)
![Venture Logo](./client/public/venture-logo-dark.svg#gh-dark-mode-only)

![Screenshot of Venture](./assets/screenshot.png)

Venture together into productivity with this group-based task management app.

## Features
* Create one-time and recurring tasks.
* Build groups and track progress together.
* Compare performance on group leaderboards.

## Tech Stack
* Frontend: React, Vite, MUI
* Backend: Node.js, Express
* Database: PostgreSQL, Prisma

## Development
Venture is made with Node.js, using the Express and Vite for the backend and frontend respectively.

These are the common dependencies you should have before starting:
* [Node.js](https://nodejs.org/en/download)
* [PostgreSQL](https://www.postgresql.org/download)
    * [Docker](https://docs.docker.com/get-started/get-docker/) is recommended for quick setup.

To set up the application for development, follow these steps:

1. Set up PostgreSQL. You can install and configure it manually, however the recommended route is to use a Docker-compatible container manager:
```
docker run --name venture-db -e POSTGRES_USER=[USERNAME] -e POSTGRES_PASSWORD=[PASSWORD] -e POSTGRES_DB=venture-db -p 5432:5432 -d postgres
```

2. We'll start the setup for the backend server. This will need a few commands to initialize. You will need Node.js, which you can get instructions on installation from [their website](https://nodejs.org/en/download).

3. Create the .env file in the `server` folder. This will store some values and secrets the Venture server will use:
```
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@localhost:5432/venture-db"
JWT_SECRET="[SECRET KEY]"
```

4. Initialize the server's development environment through these commands in the `server` folder. Be sure PostgreSQL is running and accessible.
```
npm install
npx prisma db push
npx prisma generate
```

5. Now the server is ready to start! We will move onto the client. Run this command in the `client` folder to gather the dependencies.
```
npm install
```

6. Create a `.env` file in the `client` folder with these contents:
```
VITE_API_URL="http://[BACKEND IP]:[BACKEND PORT]/api"
```

7. Now Venture is ready to test! To start the application, run `npm run dev` in both the `client` and `server` folders.
> [!NOTE]
> To test outside of your own network, run `npm run dev -- --host` for the client.

## Deployment
Similarly to development, you will need these dependencies:
* [Node.js](https://nodejs.org/en/download)
* [PostgreSQL](https://www.postgresql.org/download)
    * [Docker](https://docs.docker.com/get-started/get-docker/) is recommended for quick setup.

To set up Venture for deployment, follow these steps:
1. Set up PostgreSQL. You can install and configure it manually, however the recommended route is to use a Docker-compatible container manager:
```
docker run --name venture-db -e POSTGRES_USER=[USERNAME] -e POSTGRES_PASSWORD=[PASSWORD] -e POSTGRES_DB=venture-db -p 5432:5432 -d postgres
```

2. We'll start the setup for the backend server. This will need a few commands to initialize. You will need Node.js, which you can get instructions on installation from [their website](https://nodejs.org/en/download).

3. Create the .env file in the `server` folder. This will store some values and secrets the Venture server will use:
```
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@localhost:5432/venture-db"
JWT_SECRET="[SECRET KEY]"
```

4. Initialize the server's production environment through these commands in the `server` folder. Be sure PostgreSQL is running and accessible.
```
npm install
npx prisma db push
```

5. Now the server is ready to be built! We will move onto the client. Run this command in the `client` folder to gather the dependencies.
```
npm install
```

6. Create a `.env` file in the `client` folder with these contents:
```
VITE_API_URL="http://[BACKEND IP]:[BACKEND PORT]/api"
```

7. Now we will build both the client and the server. Run `npm run build` in both the `client` and `server` folders.

8. You can run the build server by running `npm start` in the `server` directory, and deploying the client's `dist` to a static HTTP host.
