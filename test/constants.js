
const qualification_event_encode = 'Qualification(address,bool,uint256,uint256)';

const qualification_event_type = [
    { type: 'address', name: 'account' },
    { type: 'bool', name: 'qualified' },
    { type: 'uint256', name: 'blocknumber' },
    { type: 'uint256', name: 'timestamp' },
]

const transaction_parameters = {
    gasLimit: 300000,
    gasPrice: ethers.utils.parseUnits('20', 'gwei'),
};

const luckydraw_constructor_parameters= {
    _name : "QLF_LUCKYDRAW",
    _start_time : 0,
    _max_gas_price: ethers.utils.parseUnits('400', 'gwei'),
    _min_token_amount: ethers.utils.parseUnits('100', 18),
    _token_addr : "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    _lucky_factor : 0
}

const maskTokenInitialSupply = ethers.utils.parseUnits('1000000000', 18);

module.exports = {
    qualification_event_encode,
    qualification_event_type,
    maskTokenInitialSupply,
    luckydraw_constructor_parameters,
    transaction_parameters,
}