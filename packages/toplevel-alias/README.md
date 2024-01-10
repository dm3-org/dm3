# TopLevelAliasRegistry

## Overview

The top-level alias registry is a `dm3` protocol extension to provide a decentralized register of names/domains that are mapped (via CCIP) to an ENS subdomain. The registry provides a mapping of top-level domains to their aliases in ENS.

## Project Overview

`TopLevelAliasRegistry` is a Solidity smart contract designed for managing a registry of aliases mapped to names. The contract is built to ensure that aliases follow a specific format and are managed by an owner, providing a secure and efficient way to handle alias registration.

### Key Features

-   **Alias Management:** Allows setting of aliases for given names with specific format rules.
-   **Ownership Control:** Utilizes OpenZeppelin's `Ownable` contract to restrict certain functionalities to the contract owner.
-   **Format Validation:** Enforces aliases to start with a dot, be at least a certain length, and follow a specific pattern.

## Contract Functions

### setAlias

-   **Description:** Sets an alias for a given name (= top-level).
-   **Access:** Restricted to the contract owner.
-   **Parameters:**
    -   `_name`: The name (top-level domain) to map the alias to. Must not be empty and start with ".".
    -   `_alias`: The alias to be set for the given name. Must start with a dot and follow the format rules.

### Other Functions

-   **owner**: Returns the owner of the contract.
-   **transferOwnership**: Allows the current owner to transfer control of the contract to a new owner.

## Format Rules for Aliases

-   The alias must start with a dot (e.g., `.example`).
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

Contributions to the `TopLevelAliasRegistry` sub project of the `dm3` project are welcome. Please ensure that any major changes are discussed via issues before submitting a pull request.

## License

This project is licensed under the BSD License - see the LICENSE file of the `dm3` main project for details.
