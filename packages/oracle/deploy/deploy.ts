/* eslint-disable import/no-default-export -- safe for hardhat deploy */
import type { DeployFunction } from 'hardhat-deploy/types';

import hre from 'hardhat';
import { ZeroAddress } from 'ethers';

import * as dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';

const path = '../../apps/www/.env';
dotenv.config({ path });

const func: DeployFunction = async function () {
  const { ethers } = hre;
  // eslint-disable-next-line @typescript-eslint/unbound-method -- safe
  const { deploy } = hre.deployments;
  const [owner, otherAccount] = await ethers.getSigners();

  if (!owner || !otherAccount) {
    throw new Error('No owner available');
  }

  console.log('Deploying with  Address: ', owner.address);
  await hre.fhenixjs.getFunds(owner.address);
  await hre.fhenixjs.getFunds(otherAccount.address);

  const router = await deploy('OracleRouter', {
    from: owner.address,
    args: [
      ZeroAddress,
      {
        maxConsumersPerSubscription: BigInt(100),
        handleOracleFulfillmentSelector: '0x0ca76175',
        gasForCallExactCheck: BigInt(5000),
        maxCallbackGasLimits: [BigInt(3000)],
      },
    ],
    skipIfAlreadyDeployed: false,
  });

  const coordinator = await deploy('OracleCoordinator', {
    from: owner.address,
    args: [
      owner.address,
      router.address,
      { requestTimeoutSeconds: BigInt(5 * 50) },
    ],
    skipIfAlreadyDeployed: false,
  });

  const routerContract = await ethers.getContractAt(
    'OracleRouter',
    router.address
  );

  const tx1 = await routerContract.setCoordinator(coordinator.address);
  await tx1.wait();

  const consumer = await deploy('ConsumerExample', {
    from: otherAccount.address,
    args: [router.address],
    skipIfAlreadyDeployed: false,
  });

  const contract = await ethers.getContractAt(
    'OracleCoordinator',
    coordinator.address
  );

  const tx = await contract.connect(owner).addOracleNode(owner.address);
  await tx.wait();

  const config = {
    [`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_ROUTER_ADDRESS`]:
      router.address,
    [`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_COORDINATOR_ADDRESS`]:
      coordinator.address,
    [`NEXT_PUBLIC_${hre.network.name.toUpperCase()}_CONSUMER_ADDRESS`]:
      consumer.address,
  };

  const data = readFileSync(path, { encoding: 'utf8' });

  const parsed = dotenv.parse(data);
  let updated = '';
  Object.entries({ ...parsed, ...config }).forEach(([k, v]) => {
    updated += `${k}="${v}"\n`;
  });

  writeFileSync(path, updated, { encoding: 'utf8' });
};

export default func;
func.id = 'deploy_contracts';
