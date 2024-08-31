/* eslint-disable @typescript-eslint/no-non-null-assertion -- safe */
import type { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-chai-matchers';

import 'fhenix-hardhat-plugin';
import 'fhenix-hardhat-docker';
import 'solidity-coverage';
import '@nomiclabs/hardhat-solhint';
import 'solidity-docgen';
import 'hardhat-deploy';
import './tasks';

import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MNEMONIC = process.env.MNEMONIC ?? 'your mnemonic';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  defaultNetwork: 'localfhenix',
  solidity: {
    version: '0.8.24',
  },
  networks: {
    fhenixHelium: {
      url: 'https://api.helium.fhenix.zone',
      chainId: 8008135,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : { mnemonic: MNEMONIC },
    },
    localfhenix: {
      gas: 'auto',
      gasMultiplier: 2,
      gasPrice: 'auto',
      timeout: 10_000,
      httpHeaders: {},
      url: 'http://127.0.0.1:42069',
      accounts: [
        process.env.PRIVATE_KEY_OWNER!,
        process.env.PRIVATE_KEY_OTHER!,
      ],
    },
  },
  docgen: {
    outputDir: 'docs',
    pages: 'files',
  },
  paths: {
    sources: 'src',
    tests: './tests',
  },
};

export default config;
