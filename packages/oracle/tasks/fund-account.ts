import { task } from 'hardhat/config';

task('task:fund-account')
  .addParam('address', 'Address to fund')
  .setAction(async (args: { address: string }, hre) => {
    await hre.fhenixjs.getFunds(args.address);
  });
