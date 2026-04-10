![Venture Logo](./client/src/assets/venture-logo.svg#gh-light-mode-only)
![Venture Logo](./client/src/assets/venture-logo-dark.svg#gh-dark-mode-only)

Venture together into productivity with this group-based task management app.

## Development
Venture is made with Node.js, using the Express and Vite for the backend and frontend respectively.

To set up the application for development, follow these steps:

1. Set up PostgreSQL. You can install and configure it manually, however the recommended route is to use a Docker-compatible container manager:
```
docker run --name venture-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=venture-db -p 5432:5432 -d postgres
```

2. We'll start the setup for the backend server. This will need a few commands to initialize. You will need Node.js, which you can get instructions on installation from [their website](https://nodejs.org/en/download).

3. Create the .env file in the `server` folder. This will store some values and secrets the Venture server will use:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/venture-db"
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

6. Now Venture is ready to test! To start the application, run `npm run dev` in both the `client` and `server` folders.