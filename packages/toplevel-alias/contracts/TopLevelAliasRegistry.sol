// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TopLevelAliasRegistry
 * @dev A contract for managing a registry of aliases mapped to names.
 * This contract allows the owner to set aliases for given names, ensuring aliases end with '.eth',
 * have at least three characters before '.eth', do not exceed a maximum length, and are not empty.
 */
contract TopLevelAliasRegistry is Ownable {
    // Public mapping of names to aliases
    mapping(string => string) public aliases;

    // Maximum allowed length for an alias
    uint256 private constant MAX_ALIAS_LENGTH = 100;

    // Event emitted when an alias is set
    event AliasSet(string indexed _name, string _alias);

    /**
     * @dev Constructor that sets the specified address as the owner of the contract.
     * @param initialOwner The address to be set as the initial owner of the contract.
     */
    constructor(address initialOwner) Ownable(initialOwner) {
    }

    /**
     * @dev Sets an alias for a given name, ensuring it meets various criteria including ENS validity.
     * Only the owner of the contract can call this function.
     * Validates that the name is not empty, the alias length is within limits, and ends with '.eth'.
     *
     * @param _name The name to map the alias to. Must not be empty.
     * @param _alias The alias to be set for the given name. Must meet the criteria.
     */
    function setAlias(string memory _name, string memory _alias) public onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_alias).length >= 7 && bytes(_alias).length <= MAX_ALIAS_LENGTH, "Alias length is invalid");
        require(_endsWith(_alias, ".eth"), "Alias must end with '.eth'");

        aliases[_name] = _alias;
        emit AliasSet(_name, _alias);
    }

    function _endsWith(string memory _base, string memory _value) internal pure returns (bool) {
        bytes memory baseBytes = bytes(_base);
        bytes memory valueBytes = bytes(_value);

        if (valueBytes.length > baseBytes.length) {
            return false;
        }

        for (uint i = 0; i < valueBytes.length; i++) {
            if (baseBytes[baseBytes.length - i - 1] != valueBytes[valueBytes.length - i - 1]) {
                return false;
            }
        }
        
        return true;
    }
}

   
