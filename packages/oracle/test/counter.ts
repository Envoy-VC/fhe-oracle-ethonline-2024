import { expect } from 'chai';
import hre from 'hardhat';
import { getTokensFromFaucet, createFheInstance } from '../lib';
import { before } from 'mocha';
import type { Counter } from 'typechain-types';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

interface CounterState {
  counter: Counter;
  contractAddress: string;
  owner: HardhatEthersSigner;
  otherAccount: HardhatEthersSigner;
  instance: Awaited<ReturnType<typeof createFheInstance>>;
}

describe('Lock', () => {
  let state: CounterState;
  before(async () => {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    if (!owner || !otherAccount) {
      throw new Error('No owner or other account available');
    }

    await getTokensFromFaucet(owner);
    await getTokensFromFaucet(otherAccount);

    const Counter = await hre.ethers.getContractFactory('Counter');
    const counter = await Counter.connect(owner).deploy();
    await counter.waitForDeployment();
    const contractAddress = await counter.getAddress();

    const instance = await createFheInstance(hre, contractAddress);
    state = { counter, contractAddress, owner, otherAccount, instance };
  });

  it('should add amount to the counter and verify the result', async () => {
    const { instance, counter, contractAddress, owner } = state;
    const amountToCount = 10;
    console.log('Amount to count: ', amountToCount);

    const eAmountCount = await instance.instance.encrypt_uint32(amountToCount);
    console.log('Encrypted amount: ', eAmountCount);
    await counter.connect(owner).add(eAmountCount);

    const eAmount = await counter
      .connect(owner)
      .getCounterPermitSealed(instance.permission);
    const amount = instance.instance.unseal(contractAddress, eAmount);
    console.log('Decrypted amount: ', amount);

    expect(Number(amount) === amountToCount);
  });
});
