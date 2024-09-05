/* eslint-disable import/no-default-export -- safe */
import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  createSiweMessage,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
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
    chainId: number;
    language: number;
    codeLocation: number;
    source: string;
    publicArgs: object;
    privateArgs: object;
    commitment: `0x${string}`;
    requestId: `0x${string}`;
  };

  const provider = new ethers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE);

  const wallet = new ethers.Wallet(env.PRIVATE_KEY, provider);

  const client = new LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: LitNetwork.DatilDev,
  });

  await client.connect();

  const sessionSignatures = await client.getSessionSigs({
    chain: 'ethereum',
    expiration: new Date(Date.now() + 1000 * 60 * 10).toISOString(), // 10 minutes
    resourceAbilityRequests: [
      {
        resource: new LitAccessControlConditionResource('*'),
        ability: LitAbility.AccessControlConditionDecryption,
      },
      {
        resource: new LitActionResource('*'),
        ability: LitAbility.LitActionExecution,
      },
    ],
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }) => {
      const toSign = await createSiweMessage({
        uri,
        expiration,
        resources: resourceAbilityRequests,
        walletAddress: wallet.address,
        nonce: await client.getLatestBlockhash(),
        litNodeClient: client,
      });

      return await generateAuthSig({
        signer: wallet,
        toSign,
      });
    },
  });

  // const litActionCode = body.source;

  // const codeLocation =
  //   Number(body.codeLocation) === 0
  //     ? { code: litActionCode }
  //     : { ipfsId: litActionCode };

  const response = await client.executeJs({
    // ...codeLocation,
    code: `const fetchWeatherApiResponse = async () => {
  const resp = await Lit.Actions.decryptAndCombine({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
    authSig: null,
    chain: 'ethereum',
  });

  const apiKey = JSON.parse(resp).apiKey;
  const url = 'https://api.weatherapi.com/v1/current.json?key=' + apiKey + '&q=' + city;

  const data = await fetch(url).then((response) => response.json());
  const temp = String(parseInt(data.current.temp_c));
  Lit.Actions.setResponse({ response: temp });
};

fetchWeatherApiResponse();`,
    sessionSigs: sessionSignatures,
    jsParams: {
      ...body.publicArgs,
      ...body.privateArgs,
    },
  });

  res.status(200).json({
    response,
  });
}
