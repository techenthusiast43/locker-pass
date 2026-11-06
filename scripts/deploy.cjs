const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BOT_CHAIN_RPC = process.env.BOT_CHAIN_RPC || 'https://rpc.bohr.life';
const CHAIN_ID = 968;

async function deploy() {
    console.log('🚀 Starting LockerPass deployment to BOT Chain Testnet...');
    console.log(`RPC Endpoint: ${BOT_CHAIN_RPC} (Chain ID: ${CHAIN_ID})`);

    let privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        console.error('❌ Error: PRIVATE_KEY is not defined in .env or environment variables!');
        console.log('Please set your BOT Chain testnet wallet private key in .env');
        process.exit(1);
    }

    privateKey = privateKey.trim();
    if (!privateKey.startsWith('0x')) {
        privateKey = '0x' + privateKey;
    }

    const artifactPath = path.resolve(__dirname, '../artifacts/LockerPass.json');
    if (!fs.existsSync(artifactPath)) {
        console.error('❌ Error: Artifact not found. Run "npm run compile:contract" first.');
        process.exit(1);
    }

    const { abi, bytecode } = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    const provider = new ethers.JsonRpcProvider(BOT_CHAIN_RPC, {
        chainId: CHAIN_ID,
        name: 'bot-chain-testnet'
    });

    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`Deploying with wallet address: ${wallet.address}`);

    const balance = await provider.getBalance(wallet.address);
    console.log(`Wallet Balance: ${ethers.formatEther(balance)} BOT`);

    if (balance === 0n) {
        console.warn('⚠️ Warning: Wallet has 0 BOT balance. You need testnet BOT tokens to pay for deployment gas fees.');
    }

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    console.log('Submitting contract creation transaction...');
    const contract = await factory.deploy();
    console.log(`Transaction Hash: ${contract.deploymentTransaction().hash}`);
    console.log('Waiting for block confirmation on BOT Chain...');

    await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();

    console.log(`🎉 LockerPass successfully deployed to: ${deployedAddress}`);
    console.log(`View on Explorer: https://scan.bohr.life/address/${deployedAddress}`);

    // Update frontend contract address file
    const addressFilePath = path.resolve(__dirname, '../src/utils/contractAddress.js');
    const content = `// Auto-generated contract deployment address
export const LOCKER_PASS_ADDRESS = "${deployedAddress}";
export const BOT_CHAIN_ID = 968;
`;
    fs.writeFileSync(addressFilePath, content);
    console.log(`Updated ${addressFilePath} with deployed address!`);

    // Update .env file
    const envPath = path.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');
        envContent = envContent.replace(
            /VITE_LOCKER_PASS_ADDRESS=.*/,
            `VITE_LOCKER_PASS_ADDRESS=${deployedAddress}`
        );
        fs.writeFileSync(envPath, envContent);
        console.log(`Updated .env with VITE_LOCKER_PASS_ADDRESS=${deployedAddress}`);
    }
}

deploy().catch(err => {
    console.error('Deployment failed:', err);
    process.exit(1);
});

