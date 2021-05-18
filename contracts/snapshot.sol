//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

import "hardhat/console.sol";

contract MaskTokenSnapshot {
    address contract_creator;
    uint256 block_height;
    mapping(address => uint256) balanceOf;

    modifier CreatorOnly {
        require(msg.sender == contract_creator, "Not Authorized");
        _;
    }

    constructor() {
        contract_creator = msg.sender;
        block_height = 0;
    }

    function batch_set_balance(
        uint256 _block_height, address[] memory addrs, uint256[] memory balances
    ) public CreatorOnly {
        block_height = _block_height;
        for (uint256 i = 0; i < addrs.length; i++) {
            balanceOf[addrs[i]] = balances[i];
        }
    }

    function get_balance(address addr) view public returns (uint256) {
        return balanceOf[addr];
    }

    function _set_balance(address addr, uint256 balance) private {
        balanceOf[addr] = balance;
    }
}
