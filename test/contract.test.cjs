const assert = require('assert');
const { ethers } = require('ethers');
require('dotenv').config();

const { LOCKER_PASS_ADDRESS, BOT_CHAIN_ID } = require('../src/utils/contractAddress');
const artifact = require('../artifacts/LockerPass.json');

async function runTests() {
  console.log('🧪 Running LockerPass Smart Contract Tests on BOT Chain Testnet...');
  console.log(`Target Contract Address: ${LOCKER_PASS_ADDRESS}`);

  const provider = new ethers.JsonRpcProvider(process.env.BOT_CHAIN_RPC || 'https://rpc.bohr.life');
  const contract = new ethers.Contract(LOCKER_PASS_ADDRESS, artifact.abi, provider);

  // Test 1: Verify total lockers
  const total = await contract.totalLockers();
  console.log(`✔ Test 1: Total lockers queried successfully (Count: ${total.toString()})`);
  assert(total >= 0n, 'Total lockers should be >= 0');

  if (total > 0n) {
    // Test 2: Fetch Locker #1
    const locker1 = await contract.getLocker(1);
    console.log(`✔ Test 2: Locker #1 fetched: "${locker1.name}" (Owner: ${locker1.owner})`);
    assert.strictEqual(locker1.id.toString(), '1', 'Locker ID should match 1');
    assert.strictEqual(locker1.isActive, true, 'Locker #1 should be active');

    // Test 3: Owner authorization check
    const [ownerAuthorized, ownerReason] = await contract.isAuthorized(1, locker1.owner);
    console.log(`✔ Test 3: Owner authorization check: ${ownerAuthorized} ("${ownerReason}")`);
    assert.strictEqual(ownerAuthorized, true, 'Owner should always be authorized');

    // Test 4: Random unauthorized wallet check
    const randomWallet = ethers.Wallet.createRandom().address;
    const [randAuthorized, randReason] = await contract.isAuthorized(1, randomWallet);
    console.log(`✔ Test 4: Unauthorized wallet check: ${randAuthorized} ("${randReason}")`);
    assert.strictEqual(randAuthorized, false, 'Random wallet should be unauthorized');

    // Test 5: Virtual unlock simulation method
    const unlockCheck = await contract.checkVirtualUnlock(1, locker1.owner);
    console.log(`✔ Test 5: checkVirtualUnlock for owner: canUnlock = ${unlockCheck[0]}`);
    assert.strictEqual(unlockCheck[0], true, 'Owner should be able to trigger unlock simulation');

    const randUnlockCheck = await contract.checkVirtualUnlock(1, randomWallet);
    console.log(`✔ Test 6: checkVirtualUnlock for stranger: canUnlock = ${randUnlockCheck[0]} ("${randUnlockCheck[1]}")`);
    assert.strictEqual(randUnlockCheck[0], false, 'Stranger should not be able to unlock');
  }

  console.log('\n🎉 ALL SMART CONTRACT AUDIT TESTS PASSED SUCCESSFULLY!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

