import { expect } from 'chai';
import { deploy, type FHEOracleState } from '../lib';
import { before } from 'mocha';
import type { EventLog } from 'ethers';

describe('Oracle Requests', () => {
  let state: FHEOracleState;
  let subscriptionId: string;

  before(async () => {
    state = await deploy();
  });

  const createSubscription = async () => {
    const { router, otherAccount, consumer } = state;
    const tx = await router.connect(otherAccount).createSubscription();
    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction failed');
    }
    const logs = receipt.logs[0] as EventLog;
    const res = logs.args.toObject() as {
      subscriptionId: string;
      owner: string;
    };

    subscriptionId = res.subscriptionId;

    const t1 = await router
      .connect(otherAccount)
      .addConsumer(res.subscriptionId, await consumer.getAddress());
    await t1.wait();
    return res;
  };
  it('should revert if source is not present', async () => {
    const { consumer, otherAccount } = state;
    await createSubscription();

    await expect(
      consumer
        .connect(otherAccount)
        .sendRequest(subscriptionId, '', 1, '0x', '0x', '30000000')
    ).to.reverted;
  });
  it('should send request to oracle', async () => {
    const { router, consumer, otherAccount } = state;
    await createSubscription();

    const res = await consumer
      .connect(otherAccount)
      .sendRequest(subscriptionId, '123', 1, '0x', '0x', '30000000');
    await res.wait();
    const event = (
      await router.queryFilter(router.filters.RequestStart, -1)
    ).at(0)?.args;

    if (!event?.requestId) {
      throw new Error('Request Id not found');
    }

    expect(event.subscriptionId).to.equal(subscriptionId);
    expect(event.data).to.not.be.undefined;
    expect(event.subscriptionOwner).to.equal(otherAccount.address);
    expect(event.requestingContract).to.equal(await consumer.getAddress());
  });
});
