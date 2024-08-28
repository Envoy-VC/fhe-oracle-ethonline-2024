import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';

import 'fhenix-hardhat-plugin';
import 'fhenix-hardhat-docker';
import 'solidity-coverage';
import '@nomiclabs/hardhat-solhint';
import 'solidity-docgen';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MNEMONIC = process.env.MNEMONIC ?? 'your mnemonic';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.24',
    settings: {
      viaIR: true,
    },
  },
  networks: {
    fhenixHelium: {
      url: 'https://api.helium.fhenix.zone',
      chainId: 8008135,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : { mnemonic: MNEMONIC },
    },
  },
  docgen: {
    outputDir: 'docs',
    pages: 'files',
  },
  paths: {
    sources: 'src',
    tests: 'tests',
  },
};

export default config;
