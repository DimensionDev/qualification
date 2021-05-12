const axios = require('axios');
const ethers = require("ethers");

function notUndefined(para) {
    if (typeof(para)  === 'undefined') {
        return false;
    }
    return true;
}

const sleepMs = ms => new Promise(res => setTimeout(res, ms));
const axiosConfig = {
    headers: {
        'Content-Type': 'application/json'
    }
};

async function getUrlRequest(queryURL, defaultResponse)
{
    let response;

    try {
        response = await axios.get(queryURL);
        if (response.statusCode < 200 || response.statusCode > 299) {
            return defaultResponse;
        }
    }
    catch(err) {
        console.log("axios.get() EXCEPTION:");
        return defaultResponse;
    }

    if (notUndefined(response.data)) {
        return response.data;
    }
    else {
        console.log("getPassword() ERROR: " + JSON.stringify(response.data));
        return defaultResponse;
    }
}

async function postUrlRequest(queryURL, payload, defaultResponse)
{
    let response;

    try {
        response = await axios.post(queryURL, payload, axiosConfig);
        if (response.statusCode < 200 || response.statusCode > 299) {
            return defaultResponse;
        }
    }
    catch(err) {
        console.log("axios.post() EXCEPTION:");
        return defaultResponse;
    }

    if (notUndefined(response.data)) {
        return response.data;
    }
    else {
        console.log("getPassword() ERROR: " + JSON.stringify(response.data));
        return defaultResponse;
    }
}

// Do NOT access it frequently, otherwise request might be blocked
async function getGasPrice(debug)
{
    const defaultGasPrice = {
        code: 200,
        data: {
            rapid: ethers.utils.parseUnits('122', 'gwei'),
            fast: ethers.utils.parseUnits('116', 'gwei'),
            standard: ethers.utils.parseUnits('100', 'gwei'),
            slow: ethers.utils.parseUnits('93', 'gwei'),
            timestamp: 1618448344593
        }
    };
    // Alternative: https://docs.ethgasstation.info/gas-price
    // https://ethgasstation.info/api/ethgasAPI.json?api-key=XXAPI_Key_HereXXX
    // ***Note: To convert the provided values to gwei, divide by 10.***

    // https://taichi.network/#gasnow
    const queryURL = "https://www.gasnow.org/api/v3/gas/price?utm_source=:AutomaticTraders";
    const resonse = await getUrlRequest(queryURL, defaultGasPrice);
    const priceList = resonse.data;
    // console.log(priceList);
    if (debug) {
        console.log("-------------------");
        console.log("gas price:");
        console.log("rapid: " + ethers.utils.formatUnits(priceList.rapid, 'gwei'));
        console.log("fast: " + ethers.utils.formatUnits(priceList.fast, 'gwei'));
        console.log("standard: " + ethers.utils.formatUnits(priceList.standard, 'gwei'));
        console.log("slow: " + ethers.utils.formatUnits(priceList.slow, 'gwei'));
        console.log("-------------------");
    }
    return priceList;
}

module.exports ={
    notUndefined,
    sleepMs,
    getUrlRequest,
    postUrlRequest,
    getGasPrice,
}