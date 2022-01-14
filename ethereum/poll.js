import web3 from "./web3";
const { abi } = require("./build/Poll.json");

const Poll = (address) => {
    return new web3.eth.Contract(abi, address);
}

export default Poll;
