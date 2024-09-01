import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import type { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';

export async function createFheInstance(
  hre: HardhatRuntimeEnvironment,
  contractAddress: string,
  signer: HardhatEthersSigner
) {
  const instance = hre.fhenixjs;

  const permit = await instance.generatePermit(
    contractAddress,
    undefined,
    // provider,
    signer
  );

  const permission = instance.extractPermitPermission(permit);

  return Promise.all([instance, permission]).then(([instance, permission]) => ({
    instance,
    permission,
    permit,
  }));
}
