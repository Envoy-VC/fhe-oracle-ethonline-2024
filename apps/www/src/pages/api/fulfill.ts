/* eslint-disable import/no-default-export -- safe */
import { encryptUint256 } from '~/lib/helpers';
import { coordinatorAbi } from '~/lib/viem/abi';
import { fhenixHelium, localFhenix } from '~/lib/viem/chains';

import {
  LitAbility,
  LitAccessControlConditionResource,
  LitActionResource,
  createSiweMessage,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
import { LIT_RPC, LitNetwork } from '@lit-protocol/constants';
import { LitNodeClientNodeJs } from '@lit-protocol/lit-node-client-nodejs';
import { TypedDataEncoder, ethers } from 'ethers';
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

  const encrypted = await encryptUint256({
    chainId: body.chainId,
    data: response.response as string,
  });

  const coordinatorAddress =
    body.chainId === localFhenix.id
      ? env.NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS
      : env.NEXT_PUBLIC_FHENIX_HELIUM_COORDINATOR_ADDRESS;

  const fhenixProvider = new ethers.JsonRpcProvider(
    body.chainId === localFhenix.id
      ? localFhenix.rpcUrls.default.http[0]
      : fhenixHelium.rpcUrls.default.http[0]
  );
  const transmitter = new ethers.Wallet(env.PRIVATE_KEY, fhenixProvider);

  const signers = [transmitter.address];

  const report = ethers.AbiCoder.defaultAbiCoder().encode(
    ['bytes32[]', 'bytes[]', 'bytes[]', 'bytes[]'],
    [[body.requestId], [encrypted.data], ['0x00'], [body.commitment]]
  );

  const domain = {
    name: 'FHE Oracle Coordinator',
    version: '1',
    chainId: body.chainId,
    verifyingContract: coordinatorAddress,
  };

  const types = {
    Report: [
      { name: 'requestIds', type: 'bytes32[]' },
      { name: 'results', type: 'bytes[]' },
      { name: 'errors', type: 'bytes[]' },
      { name: 'onchainMetadata', type: 'bytes[]' },
    ],
  };

  const message = {
    requestIds: [body.requestId],
    results: [encrypted.data],
    errors: ['0x00'],
    onchainMetadata: [body.commitment],
  };
  const reportHash = TypedDataEncoder.hash(domain, types, message);
  const sig = await transmitter.signTypedData(domain, types, message);

  const { v, r, s } = ethers.Signature.from(sig);
  const coordinator = new ethers.Contract(coordinatorAddress, coordinatorAbi);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call -- safe
  await coordinator
    .connect(transmitter)
    // @ts-expect-error -- safe to ignore
    .transmit(signers, report, reportHash, [r], [s], [v], {
      gasLimit: body.chainId === localFhenix.id ? 1e8 : 1e9,
    });

  res.status(200).json({
    result: {
      response: response.response,
      reportHash,
      sig,
    },
  });
}
