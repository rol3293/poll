import web3 from "./web3";
const { abi } = require("./build/PollFactory.json");

const factory = new web3.eth.Contract(abi, '0x17B82dA35E3db3D1fF7116b2da9f5622E94Ac7c6');

export default factory;
