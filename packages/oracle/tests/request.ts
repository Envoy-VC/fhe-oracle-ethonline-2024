import { expect } from 'chai';
import { createFheInstance, deploy, type FHEOracleState } from '../lib';
import { before } from 'mocha';
import type { EventLog } from 'ethers';
import { Signature, ethers, TypedDataEncoder } from 'ethers';
import hre from 'hardhat';

describe('Oracle Requests', () => {
  let state: FHEOracleState;
  let subscriptionId: string;
  let requestId: string;

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
  it('should send request to oracle', async () => {
    const { router, consumer, otherAccount } = state;
    await createSubscription();

    const res = await consumer
      .connect(otherAccount)
      .sendRequest(
        subscriptionId,
        '123',
        1,
        [{ key: 'name', value: 'vedant' }],
        '3000000'
      );
    await res.wait();
    const event = (
      await router.queryFilter(router.filters.RequestStart, -1)
    ).at(0)?.args;

    if (!event?.requestId) {
      throw new Error('Request Id not found');
    }

    requestId = event.requestId;

    expect(event.subscriptionId).to.equal(subscriptionId);
    expect(event.data).to.not.be.undefined;
    expect(event.subscriptionOwner).to.equal(otherAccount.address);
    expect(event.requestingContract).to.equal(await consumer.getAddress());
  });
  it('should fullfill request', async () => {
    const { owner, coordinator, consumer, otherAccount } = state;

    const event = (
      await coordinator.queryFilter(coordinator.filters.Request, -1)
    ).at(0)?.args;

    if (!event) {
      throw new Error('Request not found');
    }

    const commitment = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32', 'address', 'address', 'uint64', 'uint32', 'uint32'],
      [
        event.commitment[0],
        event.commitment[1],
        event.commitment[2],
        event.commitment[3],
        event.commitment[4],
        event.commitment[5],
      ]
    );

    const fheOther = await createFheInstance(
      hre,
      await consumer.getAddress(),
      otherAccount
    );

    const encryptedData = (await fheOther.instance.encrypt_uint256('23')).data;
    const encryptedResult = `0x${Buffer.from(encryptedData).toString('hex')}`;
    console.log(encryptedResult);
    // const encryptedResult = '0x22';

    const signers = [owner.address];

    const report = ethers.AbiCoder.defaultAbiCoder().encode(
      ['bytes32[]', 'bytes[]', 'bytes[]', 'bytes[]'],
      [[requestId], [encryptedResult], ['0x00'], [commitment]]
    );

    const domain = {
      name: 'FHE Oracle Coordinator',
      version: '1',
      chainId: 412346,
      verifyingContract: (await coordinator.getAddress()) as `0x${string}`,
    };

    const types = {
      Report: [
        { name: 'requestIds', type: 'bytes32[]' },
        { name: 'results', type: 'bytes[]' },
        { name: 'errors', type: 'bytes[]' },
        { name: 'onchainMetadata', type: 'bytes[]' },
      ],
    };

    const message = {
      requestIds: [requestId],
      results: [encryptedResult],
      errors: ['0x00'],
      onchainMetadata: [commitment],
    };
    const reportHash = TypedDataEncoder.hash(domain, types, message);
    const sig = await owner.signTypedData(domain, types, message);

    const { v, r, s } = Signature.from(sig);

    const tx = await coordinator
      .connect(owner)
      .transmit(signers, report, reportHash, [r], [s], [v], {
        gasLimit: 30000000,
      });

    await tx.wait();

    console.log(tx.hash);

    const consumerEvent = (
      await consumer.queryFilter(consumer.filters.Response, -1)
    ).at(0)?.args;

    console.log({
      requestId: consumerEvent?.requestId,
      response: consumerEvent?.response,
      error: consumerEvent?.err,
    });

    const sealedValue = await consumer
      .connect(otherAccount)
      .getLastResponse(fheOther.permission);

    const unsealed = fheOther.instance.unseal(
      await consumer.getAddress(),
      sealedValue
    );
    console.log('Decrypted Value', unsealed);
  });
});
