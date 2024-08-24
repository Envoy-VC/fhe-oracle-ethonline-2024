import { expect } from 'chai';
import hre from 'hardhat';
import {
  time,
  loadFixture,
} from '@nomicfoundation/hardhat-toolbox/network-helpers';

describe('Lock', () => {
  const deployOneYearLockFixture = async () => {
    const lockedAmount = 1_000_000_000;
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    const lock = await hre.ethers.deployContract('Lock', [unlockTime], {
      value: lockedAmount,
    });

    const [owner, otherAccount] = await hre.ethers.getSigners();

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  };

  it('Should set the right unlockTime', async () => {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

    // assert that the value is correct
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it('Should revert with the right error if called too soon', async () => {
    const { lock } = await loadFixture(deployOneYearLockFixture);

    await expect(lock.withdraw()).to.be.revertedWith("You can't withdraw yet");
  });

  it('Should transfer the funds to the owner', async () => {
    const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

    await time.increaseTo(unlockTime);

    // this will throw if the transaction reverts
    await lock.withdraw();
  });

  it('Should revert with the right error if called from another account', async () => {
    const { lock, unlockTime, otherAccount } = await loadFixture(
      deployOneYearLockFixture
    );

    await time.increaseTo(unlockTime);
    if (!otherAccount) {
      throw new Error(`Could not get account from Other Account`);
    }

    // We use lock.connect() to send a transaction from another account
    await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
      "You aren't the owner"
    );
  });
});
