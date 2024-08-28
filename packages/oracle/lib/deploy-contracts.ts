import hre from 'hardhat';
import { getTokensFromFaucet } from './get-tokens';
import type {
  OracleCoordinator,
  OracleRouter,
  ConsumerExample,
} from 'typechain-types';
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';

import { ZeroAddress } from 'ethers/constants';

export interface FHEOracleState {
  coordinator: OracleCoordinator;
  router: OracleRouter;
  consumer: ConsumerExample;
  owner: HardhatEthersSigner;
  otherAccount: HardhatEthersSigner;
}

export const deploy = async (): Promise<FHEOracleState> => {
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
  const consumer = await Consumer.connect(otherAccount).deploy(routerAddress);
  await consumer.waitForDeployment();

  // Add Transmitter
  const tx = await coordinator.addOracle(owner.address);
  await tx.wait();

  return {
    coordinator,
    router,
    owner,
    otherAccount,
    consumer,
  };
};
