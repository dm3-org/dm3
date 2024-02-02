# TopLevelAliasRegistry

## Overview

The top-level alias registry is a `dm3` protocol extension to provide a decentralized register of names/domains that are mapped (via CCIP) to an ENS subdomain. The registry provides a mapping of top-level domains to their aliases in ENS. (example: **gno** to **gnosis.eth** which means **name.gno** is linked to **name.gnosis.eth**).
The **top-level alias registry** is the `dm3` internal mapping between registered top-level domains and their respective ENS subdomains.
This registry is used if a **dm3**-user wants to send a message to another user using a "non"-ENS name (like **name.gno**). The registered Toplevel-Domain is then replaced by the alias to access the name (and its **dm3** profile) by reading ENS values.

The top-level alias registry is part of the **dm3** cross-chain approach. Name services of other chains or services are integrated by linking this registry to a subdomain of ENS (via CCIP) and publishing the alias information in the top-level alias registry.

The address of the current top-level alias registry is published at the text record "network.dm3.alias" of the ENS domain "toplevel.dm3.eth". Future versions can be updated by setting this entry.

In version 1 (current version) the contract is administrated by **dm3**. The governance will be extended/change to a more decentralized way in future versions.

## Definitions

**Top-level domain** A top-level domain is the domain ending of a name service. On the one hand, top-level domains are administered by ICANN, which also ensures a corresponding level of collision-free domains. In web3, TLDs are not regulated in some cases. This means that anyone could define a TLD that collides with other web3 domains or even web2 domains. However, the top-level alias registry is used in the dm3 network to ensure uniqueness and freedom from collisions. TLD must be unique.

**Alias** An alias is the ENS subdomain to which a TLD is linked. With CCIP, the content of the connected ecosystem can be accessed via ENS.

## Administration

The **top-level alias** registry is part of the **dm3** network and is needed to allow users to address receivers by their non-ENS names directly without the need to know to what ENS subdomain this registry is linked.
This registry is deployed and managed by **dm3** (in the current version). In future versions, the governance will be extended to administrate this registry based on community decisions.

In version 1 (current version), the contract is owned and administrated by the **dm3** multisig.

## Project Overview

`TopLevelAliasRegistry` is a Solidity smart contract designed for managing a registry of aliases mapped to names. The contract is built to ensure that aliases follow a specific format and are managed by an owner, providing a secure and efficient way to handle the **alias** registration.

### Key Features

-   **Alias Management:** Allows setting of aliases for given names with specific format rules.
-   **Ownership Control:** Utilizes OpenZeppelin's `Ownable` contract to restrict certain functionalities to the contract owner.
-   **Format Validation:** Enforces aliases must not start with a dot, be at least a certain length, and follow a specific pattern.

## Contract Functions

### setAlias

-   **Description:** Sets an alias for a given name (= top-level).
-   **Access:** Restricted to the contract owner.
-   **Parameters:**
    -   `_name`: The name (top-level domain) to map the alias to. Must not be empty and not start with ".".
    -   `_alias`: The alias to be set for the given name. Must not start with a dot and follow the format rules.

### Other Functions

-   **owner**: Returns the owner of the contract.
-   **transferOwnership**: Allows the current owner to transfer control of the contract to a new owner.

## Format Rules for Aliases

-   The alias must not start with a dot (e.g., `example` and not `.example`).
-   It must have at least three characters before the dot and at least two characters after the dot.
-   The total length of the alias must be within the predefined maximum limit.

## Testing the Contract

The contract comes with a suite of tests to verify its functionalities. To run these tests:

1. **Start Hardhat Test Environment:**

    ```sh
    npx hardhat test
    ```

    This command will execute the tests defined in the `test` directory of the project.

2. **Review Test Output:**
   After running the tests, you'll see the output in the terminal, indicating whether each test has passed or failed along with any error messages.

## Contributing

Contributions to the `TopLevelAliasRegistry` sub-project of the `dm3` project are welcome. Please ensure that any major changes are discussed via issues before submitting a pull request.

## License

This project is licensed under the BSD License - see the LICENSE file of the `dm3` main project for details.
