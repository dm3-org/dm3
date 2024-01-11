// SPDX-License-Identifier: BDS-2
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TopLevelAliasRegistry
 * @dev A contract for managing a registry of aliases mapped to _toplevels.
 * This contract allows the owner to set aliases for given _toplevels,
 * have at least three characters before '.' and 2 after, do not exceed a maximum length, and are not empty.
 */
contract TopLevelAliasRegistry is Ownable {
    // Public mapping of _toplevels to aliases
    mapping(string => string) public aliases;

    // Maximum allowed length for an alias
    uint256 private constant MAX_ALIAS_LENGTH = 50;

    // Event emitted when an alias is set
    event AliasSet(string indexed _toplevel, string _alias);

    /**
     * @dev Constructor that sets the specified address as the owner of the contract.
     * @param initialOwner The address to be set as the initial owner of the contract.
     */
    constructor(address initialOwner) Ownable(initialOwner) {
    }

    /**
     * @dev Sets an alias for a given name, ensuring it meets various criteria including ENS validity.
     * Only the owner of the contract can call this function.
     * Validates that the name is not empty, the alias length is within limits
     *
     * @param _toplevel The toplevel name to map the alias to. Must not be empty.
     * @param _alias The alias to be set for the given toplevel. Must meet the criteria.
     */
    function setAlias(string memory _toplevel, string memory _alias) public onlyOwner {
        require(bytes(_toplevel).length > 0, "Toplevel cannot be empty");
        require(bytes(_alias).length >= 6 && bytes(_alias).length <= MAX_ALIAS_LENGTH, "Alias length is invalid"); // min. 3 chars + "." + "min. 2 chars"
        require (bytes(_alias)[0] != '.', "Alias must not start with a dot");
        require (bytes(_toplevel)[0] != '.', "Toplevel must not start with a dot");
        
        aliases[_toplevel] = _alias;
        emit AliasSet(_toplevel, _alias);
    }

     /**
     * @dev Checks if an alias exists for the given toplevel.
     * @param _toplevel The toplevel to check for an alias.
     * @return bool True if an alias exists for the toplevel, false otherwise.
     */
    function existsAlias(string memory _toplevel) public view returns (bool) {
        return bytes(aliases[_toplevel]).length > 0;
    }
}

   
