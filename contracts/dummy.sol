// SPDX-License-Identifier: MIT

/**
 * @author          Yisi Liu
 * @contact         yisiliu@gmail.com
 * @author_time     01/06/2021
**/

pragma solidity >= 0.8.0;

import "./IQLF.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QLF_DUMMY is IQLF, Ownable {
    string public name;
    uint256 public creation_time;
    uint256 start_time;
    mapping(address => bool) black_list;

    constructor (string memory _name, uint256 _start_time) {
        name = _name;
        creation_time = block.timestamp;
        start_time = _start_time;
    }

    function get_start_time() public view returns (uint256) {
        return start_time;
    }

    function set_start_time(uint256 _start_time) public onlyOwner {
        start_time = _start_time;
    }

    function ifQualified(address) public pure override returns (bool qualified) {
        qualified = true;
    } 

    function logQualified(address account, uint256 ito_start_time) public override returns (bool qualified) {
        if (start_time > block.timestamp || ito_start_time > block.timestamp) {
            black_list[account] = true;
            return false;
        }
        if (black_list[account]) {
            return false;
        }
        emit Qualification(account, true, block.number, block.timestamp);
        return true;
    } 

    function supportsInterface(bytes4 interfaceId) external override pure returns (bool) {
        return interfaceId == this.supportsInterface.selector || 
            interfaceId == (this.ifQualified.selector ^ this.logQualified.selector) ||
            interfaceId == this.get_start_time.selector;
    }    
}