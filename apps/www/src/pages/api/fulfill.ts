/* eslint-disable import/no-default-export -- safe */
import { coordinatorAbi } from '~/lib/viem/abi';
import { fhenixHelium, localFhenix } from '~/lib/viem/chains';

import { TypedDataEncoder, ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';
import { env } from '~/env';
import type { FulfillRequestProps } from '~/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body as FulfillRequestProps & {
    encryptedResponse: { data: Uint8Array };
  };

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
    [
      [body.requestId],
      [body.encryptedResponse.data],
      ['0x00'],
      [body.commitment],
    ]
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
    results: [body.encryptedResponse.data],
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
      reportHash,
      sig,
    },
  });
}
