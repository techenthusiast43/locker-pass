const fs = require('fs');
const path = require('path');
const solc = require('solc');

function compile() {
    console.log('Compiling LockerPass.sol...');
    const contractPath = path.resolve(__dirname, '../contracts/LockerPass.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    const input = {
        language: 'Solidity',
        sources: {
            'LockerPass.sol': {
                content: source,
            },
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object'],
                },
            },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
        let hasError = false;
        output.errors.forEach(err => {
            console.log(err.formattedMessage);
            if (err.severity === 'error') hasError = true;
        });
        if (hasError) {
            console.error('Compilation failed!');
            process.exit(1);
        }
    }

    const contract = output.contracts['LockerPass.sol']['LockerPass'];
    const abi = contract.abi;
    const bytecode = contract.evm.bytecode.object;

    // Ensure target directories exist
    const artifactsDir = path.resolve(__dirname, '../artifacts');
    if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
    }

    const utilsDir = path.resolve(__dirname, '../src/utils');
    if (!fs.existsSync(utilsDir)) {
        fs.mkdirSync(utilsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(artifactsDir, 'LockerPass.json'),
        JSON.stringify({ abi, bytecode }, null, 2)
    );

    fs.writeFileSync(
        path.join(utilsDir, 'contractABI.json'),
        JSON.stringify(abi, null, 2)
    );

    console.log('✅ Successfully compiled LockerPass.sol!');
    console.log(`Saved ABI & Bytecode to artifacts/LockerPass.json and src/utils/contractABI.json`);
}

compile();

