import { expect } from 'chai';
import hre from 'hardhat';
import { getTokensFromFaucet, createFheInstance } from '../lib';
import { before } from 'mocha';
import type {
  OracleCoordinator,
  OracleRouter,
  ConsumerExample,
} from 'typechain-types';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

import { ZeroAddress } from 'ethers/constants';

interface FHEOracleState {
  coordinator: OracleCoordinator;
  router: OracleRouter;
  consumer: ConsumerExample;
  owner: HardhatEthersSigner;
  otherAccount: HardhatEthersSigner;
  instance: Awaited<ReturnType<typeof createFheInstance>>;
}

describe('FHE Oracle', () => {
  let state: FHEOracleState;
  before(async () => {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    if (!owner || !otherAccount) {
      throw new Error('No owner or other account available');
    }

    await getTokensFromFaucet(owner);
    await getTokensFromFaucet(otherAccount);

    const OracleRouter = await hre.ethers.getContractFactory('OracleRouter');
    const router = await OracleRouter.connect(owner).deploy(ZeroAddress, {
      maxConsumersPerSubscription: BigInt(100),
      handleOracleFulfillmentSelector: '0x0ca76175',
      gasForCallExactCheck: BigInt(5000),
      maxCallbackGasLimits: [BigInt(3000)],
    });

    await router.waitForDeployment();
    const routerAddress = await router.getAddress();

    const OracleCoordinator =
      await hre.ethers.getContractFactory('OracleCoordinator');
    const coordinator = await OracleCoordinator.connect(owner).deploy(
      owner.address,
      routerAddress,
      { requestTimeoutSeconds: BigInt(5 * 50) }
    );
    await coordinator.waitForDeployment();
    const coordinatorAddress = await coordinator.getAddress();

    await router.connect(owner).setCoordinator(coordinatorAddress);

    const Consumer = await hre.ethers.getContractFactory('ConsumerExample');
    const consumer = await Consumer.connect(owner).deploy(routerAddress);
    await consumer.waitForDeployment();
    const consumerAddress = await consumer.getAddress();

    const instance = await createFheInstance(hre, consumerAddress);

    state = {
      coordinator,
      router,
      owner,
      otherAccount,
      consumer,
      instance,
    };
  });

  it('should deploy all contracts', async () => {
    const { coordinator, router, consumer } = state;

    console.log('Coordinator Deployed at: ', await coordinator.getAddress());
    console.log('Router Deployed at: ', await router.getAddress());
    console.log('Consumer Deployed at: ', await consumer.getAddress());

    expect(await coordinator.getAddress()).to.not.be.undefined;
    expect(await router.getAddress()).to.not.be.undefined;
    expect(await consumer.getAddress()).to.not.be.undefined;
  });
});
