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

  const litActionCode = `
      const fetchWeatherApiResponse = async () => {
        const url = "https://api.weather.gov/gridpoints/LWX/97,71/forecast";
        let forecast;
        try {
          const response = await fetch(url).then((res) => res.json());
          forecast = response.properties.periods[day].temperature;
                } catch(e) {
          console.log(e);
        }
        LitActions.setResponse({ response: JSON.stringify(forecast) });
      };

      fetchWeatherApiResponse();
    `;

  const response = await client.executeJs({
    code: litActionCode,
    sessionSigs: sessionSignatures,
    jsParams: {
      day: '1',
    },
  });

  res.status(200).json({
    sessionSignatures,
    response,
  });
}
