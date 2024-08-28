import { expect } from 'chai';
import { deploy, type FHEOracleState } from '../lib';
import { before } from 'mocha';
import type { EventLog } from 'ethers';

describe('Oracle Requests', () => {
  let state: FHEOracleState;
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

    const t1 = await router
      .connect(otherAccount)
      .addConsumer(res.subscriptionId, await consumer.getAddress());
    await t1.wait();
    return res;
  };
  it('should send request to oracle', async () => {
    const { router, consumer, otherAccount } = state;
    const { subscriptionId } = await createSubscription();

    const res = await consumer
      .connect(otherAccount)
      .sendRequest(
        subscriptionId,
        '123',
        1,
        [{ key: 'name', value: 'vedant' }],
        '300000'
      );
    await res.wait();
    const event = (
      await router.queryFilter(router.filters.RequestStart, -1)
    ).at(0)?.args;

    expect(event?.requestId).to.not.be.undefined;
  });
});
