import web3 from "./web3";
const { abi } = require("./build/PollFactory.json");

const factory = new web3.eth.Contract(abi, '0x5578d338836e669890dc33312a54792A3cf914b6');

export default factory;
