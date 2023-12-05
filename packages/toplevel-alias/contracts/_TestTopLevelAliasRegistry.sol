// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../contracts/TopLevelAliasRegistry.sol";

contract TestTopLevelAliasRegistry is TopLevelAliasRegistry {
    function testEndsWith(string memory _base, string memory _value) public pure returns (bool) {
        return _endsWith(_base, _value);
    }
}
