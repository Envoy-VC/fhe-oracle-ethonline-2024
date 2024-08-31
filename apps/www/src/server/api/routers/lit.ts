import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { generateSessionKeyPair } from '@lit-protocol/crypto';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import type { SessionKeyPair } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { LocalStorage } from 'node-localstorage';
// import { createWalletClient, http } from 'viem';
// import { privateKeyToAccount } from 'viem/accounts';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const litRouter = createTRPCRouter({
  fulfill: publicProcedure.input(z.object({}).optional()).mutation(async () => {
    // const provider = new ethers.providers.JsonRpcProvider({
    //   skipFetchSetup: true,
    //   url: LIT_RPC.CHRONICLE_YELLOWSTONE,
    // });

    // const wallet = new ethers.Wallet(
    //   '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
    //   provider
    // );

    const client = new LitNodeClientNodeJs({
      alertWhenUnauthorized: false,
      litNetwork: LitNetwork.DatilDev,
      // storageProvider: {
      //   provider: new LocalStorage('./lit_storage.db'),
      // },
    });

    await client.connect();

    const sessionKey = generateSessionKeyPair() as SessionKeyPair;
    const sessionKeyUri = client.getSessionKeyUri(sessionKey.publicKey);

    return {
      sessionKey,
      sessionKeyUri,
    };
  }),
});
