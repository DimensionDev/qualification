// SPDX-License-Identifier: MIT

/**
 * @author          Andy Jiang
 * @contact         andy@mask.io
 * @author_time     01/06/2021
 * @maintainer      Andy Jiang
 * @maintain_time   01/06/2021
**/

pragma solidity >= 0.8.0;

import "./IQLF.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QLF_LUCKYDRAW is IQLF, Ownable {
    // qualification smart contract name
    string public name;

    // when(block.timestamp) the smart contract is created
    uint256 public creation_time;

    // qualification start time
    // in this sample smart contract, it requires(start_time <= block.timestamp)
    // set to 0 to disable this feature
    uint256 public start_time;

    // highest gas price in wei
    // set a large number to disable this feature
    uint256 public max_gas_price;

    // the token address and minimum amount of tokens a user needs to hold to participate the ITO
    // in this sample contract, this qualification factor can be bypassed by *whilte_list*
    address public token_addr;
    uint256 public min_token_amount;

    // chance to be selected as a lucky user, 4 levels supported:
    //      0 : 100%, actually, lucky draw feature disabled
    //      1 : 75% chance
    //      2 : 50% chance
    //      3 : 25% chance
    //      Others : 0%, do NOT use
    uint8 public lucky_factor;

    mapping(address => bool) black_list;
    mapping(address => bool) whilte_list;

    constructor (string memory _name,
                uint256 _start_time,
                uint256 _max_gas_price,
                uint256 _min_token_amount,
                address _token_addr,
                uint8 _lucky_factor) {
        name = _name;
        creation_time = block.timestamp;
        start_time = _start_time;
        max_gas_price = _max_gas_price;
        min_token_amount = _min_token_amount;
        token_addr = _token_addr;
        lucky_factor = _lucky_factor;
    }

    function get_start_time() public view returns (uint256) {
        return start_time;
    }

    function set_start_time(uint256 _start_time) public onlyOwner {
        start_time = _start_time;
    }

    function set_max_gas_price(uint256 _max_gas_price) public onlyOwner {
        max_gas_price = _max_gas_price;
    }

    function set_min_token_amount(uint256 _min_token_amount) public onlyOwner {
        min_token_amount = _min_token_amount;
    }

    function set_lucky_factor(uint8 _lucky_factor) public onlyOwner {
        lucky_factor = _lucky_factor;
    }

    function set_token_addr(address _token_addr) public onlyOwner {
        token_addr = _token_addr;
    }

    /**
     * add_whitelist() add accounts into the white list
     * addrs                   list of whitelisted addresses
    **/
    function add_whitelist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            whilte_list[addrs[i]] = true;
        }
    }

    /**
     * remove_whitelist() remove accounts from the white list
     * addrs                   list of whitelisted addresses
    **/
    function remove_whitelist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            delete whilte_list[addrs[i]];
        }
    }

    /**
     * add_blacklist() add accounts into the blacklist
     * addrs                   list of blacklisted addresses
    **/
    function add_blacklist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            black_list[addrs[i]] = true;
        }
    }

    /**
     * remove_blacklist() remove accounts from the blacklist
     * addrs                   list of blacklisted addresses
    **/
    function remove_blacklist(address[] calldata addrs) external onlyOwner {
        for (uint256 i = 0; i < addrs.length; i++) {
            delete black_list[addrs[i]];
        }
    }

    /**
     * logQualified() NOT used at the moment
    **/
    function ifQualified(address account) public view override returns (bool qualified) {
        qualified = (whilte_list[account] || IERC20(token_addr).balanceOf(account) >= min_token_amount);
    } 

    /**
     * logQualified() Mask ITO main smart contract will call this function to check if an account is qualified for the ITO
     * account                   address of the account
     * ito_start_time            ITO start time
     *                           In this sample smart contract, it requires(ito_start_time <= block.timestamp)
    **/
    function logQualified(address account, uint256 ito_start_time) public override returns (bool qualified) {
        if (tx.gasprice > max_gas_price) {
            revert("Gas price too high");
        }
        if (!whilte_list[account])
            require(IERC20(token_addr).balanceOf(account) >= min_token_amount, "Not holding enough tokens");

        if (start_time > block.timestamp || ito_start_time > block.timestamp) {
            revert("Not started.");
        }
        require(black_list[account] == false, "Blacklisted");
        if (isLucky(account) == false) {
            emit Qualification(account, false, block.number, block.timestamp);
            revert("Not lucky enough");
        }
        emit Qualification(account, true, block.number, block.timestamp);
        qualified = true;
    } 

    function supportsInterface(bytes4 interfaceId) external override pure returns (bool) {
        return interfaceId == this.supportsInterface.selector || 
            interfaceId == (this.ifQualified.selector ^ this.logQualified.selector) ||
            interfaceId == this.get_start_time.selector ||
            interfaceId == this.isLucky.selector;
    }

    /**
     * isLucky() test if an account is lucky
     * account                   address of the account
    **/
    function isLucky(address account) public view returns (bool) {
        if (lucky_factor == 0) {
            return true;
        }
        uint256 blocknumber = block.number;
        uint256 random_block = blocknumber - 1 - uint256(
            keccak256(abi.encodePacked(blockhash(blocknumber-1), account))
        ) % 255;
        bytes32 sha = keccak256(abi.encodePacked(blockhash(random_block), account, block.coinbase, block.difficulty));
        return ((uint8(sha[0]) & 0x03) >= lucky_factor);
    }
}
