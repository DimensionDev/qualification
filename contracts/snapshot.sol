//SPDX-License-Identifier: MIT
pragma solidity >= 0.8.0;

// import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QLF_SNAPSHOT is Ownable {
    uint256 public block_height;
    mapping(address => uint256) balanceOf;

    constructor() {
        block_height = 0;
    }

    function batch_set_balance(
        uint256 _block_height, address[] memory addrs, uint256[] memory balances
    ) public onlyOwner {
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
