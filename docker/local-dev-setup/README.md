# Local dev setup

## When to use this setup

Being able to run all required software locally is useful for development and testing. This docker compose file starts several services that require little to no configuration and provide an environment that allows the other packages to be started in local node instances.

## How to use this setup

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Install [Docker Compose](https://docs.docker.com/compose/install/)
3. Run `docker-compose up` in the `docker/local-dev-setup` directory
4. Then, start the other packages in local node instances following the instructions in their respective READMEs and package.json files.
