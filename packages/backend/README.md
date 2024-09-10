# dm3-backend

## Getting Started

### Build

```
cd ../../ && yarn build
```

#### Contributing

Whenever the prisma schema is updated, run the following command to generate the types:

1.  `prisma-create-migrations`: this will add a new migration to the migrations folder, which will be committed to the repository. Our server environments do not generate the migrations on the fly, so we need to commit the migration to the repository. This requires a running database, so make sure to have the database running before running this command.
2.  `prisma-generate`: this will generate the types for the prisma schema (and the client). This step is executed automatically when running on the server.

Fogetting step #1 will result in the server not being able to start, as the types will be missing.

### Usage

yarn

```
yarn start
```
