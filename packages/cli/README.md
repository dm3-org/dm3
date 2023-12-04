# DM3 CLI

## SETUP BillboardDs


### Overview

The CLI command "setup billboardDs" is used to configure a DM3 delivery service for your domain. It initiates all the necessary on-chain transactions and provides an environment configuration that you can use for the delivery service (DS).
It also configures subdomains for .addr and ds, enabling them to resolve requests via the provided gateway.

### Usage

`setup billboardDs --rpc <RPC_URL> --pk <PRIVATE_KEY> --domain <ENS_DOMAIN> --gateway <GATEWAY_URL> --deliveryService <DELIVERY_SERVICE_URL> --profilePk <PROFILE_PRIVATE_KEY> --ensRegistry <ENS_REGISTRY_ADDRESS> --ensResolver <ENS_RESOLVER_ADDRESS> --erc3668Resolver <ERC3668_RESOLVER_ADDRESS>`

### OPTIONS

-   --rpc <RPC_URL>: The Ethereum RPC URL to connect to.
-   --pk <PRIVATE_KEY>: The private key of the account owning the domain. That account will be used to execute the tx and has to be funded accordingly.
-   --domain <ENS_DOMAIN>: The ENS (Ethereum Name Service) domain associated with dm3. It has to be owned by the account used as Private Key.
-   --gateway <GATEWAY_URL>: The URL of the gateway service used for ccip data retrieval.
-   --deliveryService <DELIVERY_SERVICE_URL>: The URL of the delivery service.
-   --profilePk <PROFILE_PRIVATE_KEY>: The private key used as a seed to create the delivery service. When omitted, a random private key will be created.
-   --ensRegistry <ENS_REGISTRY_ADDRESS>: The address of the ENS registry contract.
-   --ensResolver <ENS_RESOLVER_ADDRESS>: The address of the ENS public resolver contract.
-   --erc3668Resolver <ERC3668_RESOLVER_ADDRESS>: The address of the ERC3668 resolver contract.

### Example

`setup billboardDs --rpc http://127.0.0.1:8545 --pk 0x123456789abcdef --domain alice.eth --gateway https://gateway.io/ --deliveryService https://ds.io/ --profilePk 0x987654321fedcba --ensRegistry 0xabcdef123456789 --ensResolver 0xfedcba987654321 --erc3668Resolver 0x123456789abcdef0`


## Setup Offchain DS

### Overview

The CLI command "setup onchainDs" can be used to configure the minimal viable version of a Delivery Service (DS). It creates a Delivery Service Profile on-chain and prints the environment variables needed to run your own DS.
To set a DS up run the following steps

1. Run the command below to create the delivery service profile on-chain.
2. Copy the Docker Compose file to your project using the command: `cp docker/ds-minimal/docker-compose.yml $YOUR_PROJECT_PATH`.
3. Create an .env file at the same directory and copy the values created at step one into that file
4. Start the Delivery Service with `docker compose up`

### Usage

`setup offchainDS --rpc <RPC_URL> --pk <PRIVATE_KEY> --domain <ENS_DOMAIN>  --deliveryService <DELIVERY_SERVICE_URL> --profilePk <PROFILE_PRIVATE_KEY> --ensResolver <ENS_RESOLVER_ADDRESS> `

### OPTIONS

-   --rpc <RPC_URL>: The Ethereum RPC URL to connect to.
-   --pk <PRIVATE_KEY>: The private key of the account owning the domain. That account will be used to execute the tx and has to be funded accordingly.
-   --domain <ENS_DOMAIN>: The ENS (Ethereum Name Service) domain associated with dm3. It has to be owned by the account used as Private Key.
-   --deliveryService <DELIVERY_SERVICE_URL>: The URL of the delivery service.
-   --profilePk <PROFILE_PRIVATE_KEY>: The private key used as a seed to create the delivery service. When omitted, a random private key will be created.
-   --ensResolver <ENS_RESOLVER_ADDRESS>: The address of the ENS public resolver contract.

### Example

`setup offchainDS --rpc http://127.0.0.1:8545 --pk 0x123456789abcdef --domain alice.eth --deliveryService https://ds.io/ --profilePk 0x987654321fedcba --ensResolver 0xfedcba987654321 `


## Profile

The CLI command "setup" is used to create a dm3 user profile based on an existing privateKey or a randomly created one. 

### Usage

`yarn cli profile --deliveryService foo.eth --profilePk 0x123`
-   --deliveryService <DELIVERY_SERVICE_URL>: The URL of the delivery service.
-   --profilePk <PROFILE_PK>: Optionally, if provided, the profile will be created based on that key. Otherwise, a random key will be generated.

