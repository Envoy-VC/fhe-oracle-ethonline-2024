/* eslint-disable import/no-default-export -- safe for hardhat deploy */
import type { DeployFunction } from 'hardhat-deploy/types';

import hre from 'hardhat';
import { ZeroAddress } from 'ethers';
import { writeFileSync } from 'node:fs';

const func: DeployFunction = async function () {
  const { fhenixjs, ethers } = hre;
  const deployPlugin = hre.deployments;
  const [signer, otherAccount] = await ethers.getSigners();

  if (!signer || !otherAccount) {
    throw new Error('No signer available');
  }

  console.log('Deploying With Address: ', signer.address);

  if (
    (await ethers.provider.getBalance(signer.address)).toString() === '0' ||
    (await ethers.provider.getBalance(otherAccount.address)).toString() === '0'
  ) {
    if (hre.network.name === 'localfhenix') {
      await fhenixjs.getFunds(signer.address);
      await fhenixjs.getFunds(otherAccount.address);
    } else {
      throw new Error('No funds in signer account');
    }
  }

  const router = await deployPlugin.deploy('OracleRouter', {
    from: signer.address,
    args: [
      ZeroAddress,
      {
        maxConsumersPerSubscription: BigInt(100),
        handleOracleFulfillmentSelector: '0x0ca76175',
        gasForCallExactCheck: BigInt(5000),
        maxCallbackGasLimits: [BigInt(3000)],
      },
    ],
    skipIfAlreadyDeployed: true,
  });

  const coordinator = await deployPlugin.deploy('OracleCoordinator', {
    from: signer.address,
    args: [
      signer.address,
      router.address,
      { requestTimeoutSeconds: BigInt(5 * 50) },
    ],
    skipIfAlreadyDeployed: true,
  });

  const consumer = await deployPlugin.deploy('ConsumerExample', {
    from: otherAccount.address,
    args: [router.address],
    skipIfAlreadyDeployed: true,
  });

  const contract = await ethers.getContractAt(
    'OracleCoordinator',
    coordinator.address
  );

  const tx = await contract.addOracle(signer.address);
  await tx.wait();

  console.log(`Router contract: `, router.address);
  console.log(`Coordinator contract: `, coordinator.address);
  console.log(`Consumer contract: `, consumer.address);

  const basePath = '../indexer/abi';

  writeFileSync(`${basePath}/OracleRouter.json`, JSON.stringify(router.abi));
  writeFileSync(
    `${basePath}/OracleCoordinator.json`,
    JSON.stringify(coordinator.abi)
  );
  writeFileSync(
    `${basePath}/ConsumerExample.json`,
    JSON.stringify(consumer.abi)
  );
};

export default func;
func.id = 'deploy_contracts';
