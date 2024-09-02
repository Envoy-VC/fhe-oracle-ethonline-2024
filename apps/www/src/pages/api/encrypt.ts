/* eslint-disable import/no-default-export -- safe */
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '~/env';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as {
    data: string;
  };
  const provider = new ethers.providers.JsonRpcProvider({
    skipFetchSetup: true,
    url: LIT_RPC.CHRONICLE_YELLOWSTONE,
  });

  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

  const client = new LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: LitNetwork.DatilDev,
  });

  await client.connect();

  const data = body.data;
  const { ciphertext, dataToEncryptHash } = await client.encrypt({
    dataToEncrypt: Uint8Array.from(Buffer.from(data, 'utf-8')),
    accessControlConditions: [
      {
        contractAddress: '',
        standardContractType: '',
        chain: 'ethereum',
        method: '',
        parameters: [':userAddress'],
        returnValueTest: {
          comparator: '=',
          value: wallet.address,
        },
      },
    ],
  });

  res.status(200).json({
    ciphertext,
    dataToEncryptHash,
  });
}
