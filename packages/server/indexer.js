/**
 * Watches for onchain events and records them to database
 */

require('dotenv').config();
const rpc = process.env.ETHEREUM_PROVIDER;
const deploymentAddr = process.env.CONTRACT_ADDRESS;
const Web3 = require('web3');
const web3 = new Web3(rpc);
const { Funder }= require('./models/funder');
const { Bounty } = require('./models/bounty');

function main() {
    const subscription = web3.eth.subscribe('logs', {
        address: deploymentAddr
    }, processEvent);

    function processEvent(event) {
        console.log(event);
    }
}

main();