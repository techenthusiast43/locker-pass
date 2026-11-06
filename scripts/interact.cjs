const { ethers } = require('ethers');
const path = require('path');
require('dotenv').config();

const { LOCKER_PASS_ADDRESS, BOT_CHAIN_ID } = require('../src/utils/contractAddress');
const artifact = require('../artifacts/LockerPass.json');

async function checkLiveStatus() {
    console.log('🔍 Checking LockerPass on BOT Chain Testnet...');
    console.log(`Contract: ${LOCKER_PASS_ADDRESS}`);
    console.log(`Chain ID: ${BOT_CHAIN_ID}`);

    const provider = new ethers.JsonRpcProvider(process.env.BOT_CHAIN_RPC || 'https://rpc.bohr.life');
    const contract = new ethers.Contract(LOCKER_PASS_ADDRESS, artifact.abi, provider);

    const total = await contract.totalLockers();
    console.log(`📊 Total Registered Lockers on-chain: ${total.toString()}`);

    const blockNumber = await provider.getBlockNumber();
    console.log(`🧱 Current BOT Chain Block Number: ${blockNumber}`);

    if (process.env.PRIVATE_KEY) {
        let pk = process.env.PRIVATE_KEY.trim();
        if (!pk.startsWith('0x')) pk = '0x' + pk;
        const wallet = new ethers.Wallet(pk, provider);
        const bal = await provider.getBalance(wallet.address);
        console.log(`💳 Deployer Wallet (${wallet.address}) Balance: ${ethers.formatEther(bal)} BOT`);

        // If no lockers exist yet, register an initial demonstration locker
        if (total === 0n) {
            console.log('\n🚀 Registering initial Genesis Locker on-chain for instant testing...');
            const contractWithSigner = contract.connect(wallet);
            const tx = await contractWithSigner.registerLocker(
                'Genesis Vault Station #01',
                'BOT Chain Virtual Hub - Sector 1'
            );
            console.log(`Transaction submitted: ${tx.hash}`);
            console.log('Waiting for block confirmation...');
            await tx.wait();
            console.log('✅ Genesis Locker successfully registered on BOT Chain!');
            
            const newTotal = await contract.totalLockers();
            console.log(`New total lockers: ${newTotal.toString()}`);
        }
    }
}

checkLiveStatus().catch(console.error);

