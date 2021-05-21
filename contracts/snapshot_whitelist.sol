// SPDX-License-Identifier: MIT

/**
 * @author          Hancheng Zhou
 * @contact         z308114274@gmail.com
 * @author_time     05/09/2021
**/

pragma solidity >= 0.8.0;

import "./IQLF.sol";
import "./IMTS.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QLF_SNAPSHOT_WHITELIST is IQLF, Ownable {
    using SafeERC20 for IERC20;

    string public name;
    uint256 public creation_time;
    uint256 public start_time;
    address public snapshot_addr;
    uint256 public min_token_amount;
    mapping(address => bool) black_list;

    constructor (string memory _name, uint256 _start_time) {
        name = _name;
        creation_time = block.timestamp;
        start_time = _start_time;
    }

    function get_name() public view returns (string memory) {
        return name;
    }

    function get_start_time() public view returns (uint256) {
        return start_time;
    }

    function set_snapshot_addr(address _address) public onlyOwner {
        snapshot_addr = _address;
    }

    function set_start_time(uint256 _start_time) public onlyOwner {
        start_time = _start_time;
    }

    function set_min_token_amount(uint256 _amount) public onlyOwner {
        min_token_amount = _amount;
    }

    function ifQualified(address account) public view override returns (bool qualified) {
        if (IMTS(address(snapshot_addr)).get_balance(account) < min_token_amount) {
            return false;
        }
        qualified = true;
    } 

    function logQualified(address account, uint256 ito_start_time) public override returns (bool qualified) {
        if (IMTS(address(snapshot_addr)).get_balance(account) < min_token_amount) {
            return false;
        }              
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

