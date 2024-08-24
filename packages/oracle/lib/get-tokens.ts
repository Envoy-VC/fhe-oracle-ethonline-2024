import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import hre from 'hardhat';

export async function getTokensFromFaucet(signer?: HardhatEthersSigner) {
  if (hre.network.name === 'localfhenix') {
    let owner: HardhatEthersSigner;
    if (!signer) {
      const signers = await hre.ethers.getSigners();
      if (!signers[0]) return;
      owner = signers[0];
    } else {
      owner = signer;
    }

    if (
      (await hre.ethers.provider.getBalance(owner.address)).toString() === '0'
    ) {
      await hre.fhenixjs.getFunds(owner.address);
    }
  }
}
