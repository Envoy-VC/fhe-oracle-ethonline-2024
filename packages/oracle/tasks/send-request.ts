import type { EventLog } from 'ethers';
import { task } from 'hardhat/config';

task('task:send-request').setAction(async (_args, hre) => {
  const { ethers, deployments } = hre;
  const [owner, otherAccount] = await ethers.getSigners();

  if (!owner || !otherAccount) {
    return;
  }

  const routerAddress = (await deployments.get('OracleRouter')).address;
  const router = await ethers.getContractAt('OracleRouter', routerAddress);

  const consumerAddress = (await deployments.get('ConsumerExample')).address;
  const consumer = await ethers.getContractAt(
    'ConsumerExample',
    consumerAddress
  );

  const tx1 = await router.connect(otherAccount).createSubscription();
  const receipt = await tx1.wait();
  if (!receipt) {
    throw new Error('Transaction failed');
  }
  const logs = receipt.logs[0] as EventLog;
  const res = logs.args.toObject() as {
    subscriptionId: string;
    owner: string;
  };

  const t1 = await router
    .connect(otherAccount)
    .addConsumer(res.subscriptionId, consumerAddress);
  await t1.wait();

  const res1 = await consumer
    .connect(otherAccount)
    .sendRequest(res.subscriptionId, '123', 1, '0x', '0x', '30000000');
  await res1.wait();
  const event = (await router.queryFilter(router.filters.RequestStart, -1)).at(
    0
  )?.args;
  const requestId = event?.requestId;
  console.log('Request Id:', requestId);
});
