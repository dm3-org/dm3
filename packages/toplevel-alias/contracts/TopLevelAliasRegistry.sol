// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title TopLevelAliasRegistry
 * @dev A contract for managing a registry of aliases mapped to names.
 * Allows a group of admins to set aliases for given names, ensuring aliases end with '.eth',
 * have at least three characters before '.eth', do not exceed a maximum length, are not empty,
 * and are valid ENS names.
 */
contract TopLevelAliasRegistry {
    // Mapping of names to aliases
    mapping(string => string) private aliases;

    // Mapping of addresses to their admin status
    mapping(address => bool) private admins;

    // Counter for the number of admins
    uint256 private adminCount;

    // Maximum allowed length for an alias
    uint256 private constant MAX_ALIAS_LENGTH = 100;

    // Event emitted when an alias is set
    event AliasSet(string indexed _name, string _alias);

    /**
     * @dev Sets the deployer of the contract as an initial admin.
     */
    constructor() {
        admins[msg.sender] = true;
        adminCount = 1;
    }

    /**
     * @dev Sets an alias for a given name, ensuring it meets various criteria including ENS validity.
     * Can only be called by an admin.
     *
     * @param _name The name to map the alias to. Must not be empty.
     * @param _alias The alias to be set for the given name.
     */
    function setAlias(string memory _name, string memory _alias) public onlyAdmin {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_alias).length >= 7, "Alias must be at least 7 characters long");
        require(bytes(_alias).length <= MAX_ALIAS_LENGTH, "Alias is too long");
        require(_endsWith(_alias, ".eth"), "Alias must end with '.eth'");

        aliases[_name] = _alias;

        emit AliasSet(_name, _alias);
    }

    /**
     * @dev Retrieves the alias for a given name.
     *
     * @param _name The name whose alias is to be retrieved.
     * @return The alias corresponding to the given name.
     */
    function getAlias(string memory _name) public view returns (string memory) {
        return aliases[_name];
    }

    /**
     * @dev Checks if a given address is an admin.
     * This is a helper function to access the admin status from outside the contract.
     *
     * @param user The address to check for admin status.
     * @return bool True if the address is an admin, false otherwise.
     */
    function isAdmin(address user) public view returns (bool) {
        return admins[user];
    }
    
    /**
     * @dev Modifier to restrict functions to admin only access.
     */
    modifier onlyAdmin() {
        require(admins[msg.sender], "Only an admin can perform this action");
        _;
    }

    /**
     * @dev Adds or removes admin status for a given address.
     * Ensures that there is always at least one admin.
     * Can only be called by an existing admin.
     *
     * @param _user The address to grant or revoke admin status.
     * @param _status The admin status to be set (true for admin, false otherwise).
     */
    function setAdminStatus(address _user, bool _status) public onlyAdmin {
        require(_user != address(0), "Invalid address");
        require(adminCount > 1 || _status == true, "Cannot remove the last admin");
        if (_status && !admins[_user]) {
            adminCount++;
        } else if (!_status && admins[_user]) {
            adminCount--;
        }
        admins[_user] = _status;
    }

    /**
     * @dev Internal function to check if a string ends with a specific suffix.
     *
     * @param _base The string to check.
     * @param _value The suffix to look for.
     * @return bool True if _base ends with _value, false otherwise.
     */
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
