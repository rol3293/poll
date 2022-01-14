const PrivateKeyProvider = require('truffle-privatekey-provider');
const Web3 = require('web3');
const compiledFactory = require("./build/PollFactory.json");
const {loadGetInitialProps} = require("next/dist/shared/lib/utils");

const privateKey = '9c5a10f0fa1bda43aa484b00a8b303f021f6d86324ed25c520e9de30edd4c26c';

const provider = new PrivateKeyProvider(privateKey, 'https://rinkeby.infura.io/v3/0e9da8eadf874f8486702b17593c9c6e');
const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();

    console.log('Attempting to deploy from account', accounts[0]);

    const result = await new web3.eth.Contract(compiledFactory.abi)
        .deploy({ data: compiledFactory.evm.bytecode.object })
        .send({ from: accounts[0], gas: 2990000});

    console.log('Contract deployed to', result.options.address); // latest address 0xc545e911E420D87DD2ed3F94C12a762F031901e7
};
deploy().then();
