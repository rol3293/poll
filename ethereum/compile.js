const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const pollPath = path.resolve(__dirname, 'contracts', 'Poll.sol');
const source = fs.readFileSync(pollPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Poll.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));

const exportPath = path.resolve(__dirname, 'build');
fs.removeSync(exportPath);
fs.ensureDirSync(exportPath);

for (const contractName in output.contracts['Poll.sol']) {
    fs.outputJSONSync(
        path.resolve(exportPath, `${contractName.replace('.sol', '')}.json`),
        output.contracts['Poll.sol'][contractName]
    );
}
