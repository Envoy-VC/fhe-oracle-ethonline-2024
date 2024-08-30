import { expect } from 'chai';
import { deploy, type FHEOracleState } from '../lib';
import { before } from 'mocha';
import type { EventLog } from 'ethers';

describe('Subscriptions', () => {
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

  it('should create a new subscription', async () => {
    const { otherAccount } = state;
    const res = await createSubscription();

    expect(res.subscriptionId).to.not.be.undefined;
    expect(res.owner).to.equal(otherAccount.address);
  });
  it('should be able to cancel subscription', async () => {
    const { router, otherAccount } = state;
    const res = await createSubscription();
    const tx = await router
      .connect(otherAccount)
      .cancelSubscription(res.subscriptionId);
    await tx.wait();

    const event = (
      await router.queryFilter(router.filters.SubscriptionCanceled, -1)
    ).at(0)?.args;

    expect(event?.subscriptionId).to.equal(res.subscriptionId);
  });
  it('should be able to add consumer', async () => {
    const { router, consumer } = state;
    const { subscriptionId } = await createSubscription();

    const res = await router.getConsumer(
      await consumer.getAddress(),
      subscriptionId
    );
    expect({
      allowed: res.allowed,
      initiatedRequests: res.initiatedRequests,
      completedRequests: res.completedRequests,
    }).to.be.deep.equal({
      allowed: true,
      initiatedRequests: BigInt(0),
      completedRequests: BigInt(0),
    });
  });
  it('should be able to remove consumer', async () => {
    const { router, consumer, otherAccount } = state;
    const { subscriptionId } = await createSubscription();

    const tx = await router
      .connect(otherAccount)
      .removeConsumer(subscriptionId, await consumer.getAddress());

    await tx.wait();

    const event = (
      await router.queryFilter(router.filters.SubscriptionConsumerRemoved, -1)
    ).at(0)?.args;

    expect(event?.subscriptionId).to.be.eq(subscriptionId);
    expect(event?.consumer).to.be.eq(await consumer.getAddress());
  });
});
