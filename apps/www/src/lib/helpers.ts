import { decodeAllSync, encodeAsync } from 'cbor';
import { BrowserProvider, ethers } from 'ethers';
import { type Provider, type Signer } from 'ethers';
import { FhenixClient, generatePermit, getPermit } from 'fhenixjs';
import { createPublicClient, fromBytes, http, toBytes, toHex } from 'viem';
import { env } from '~/env';

import { fhenixHelium, localFhenix } from './viem/chains';

export const getEncryptedData = async (name: string, value: string) => {
  const data = JSON.stringify({ [name]: value });

  const accessControlConditions = [
    {
      contractAddress: '',
      standardContractType: '',
      chain: 'ethereum',
      method: '',
      parameters: [':userAddress'],
      returnValueTest: {
        comparator: '=',
        value: '0xD9153821aF6e910eE43D92f6FD7a610B67D5Df3F',
      },
    },
  ];

  const { ciphertext, dataToEncryptHash } = (await fetch('/api/encrypt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  }).then((d) => d.json())) as {
    ciphertext: string;
    dataToEncryptHash: string;
  };

  const encrypted = await encodeAsync({
    accessControlConditions,
    ciphertext,
    dataToEncryptHash,
  });

  return fromBytes(encrypted, 'hex');
};

export const encodeData = async (data: object) => {
  const cbor = await encodeAsync(data);
  return toHex(cbor);
};

export const decodeData = (hex: string) => {
  const data = decodeAllSync(toBytes(hex));
  return data;
};

export const parseJson = (data: ReturnType<typeof decodeData>, obj: object) => {
  data.forEach((value, index) => {
    if (index % 2 === 0) {
      // @ts-expect-error -- safe to ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- safe
      if (!Array.isArray(data[index + 1])) obj[value] = data[index + 1];
      // @ts-expect-error -- safe to ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- safe
      else obj[value] = parseJson(data[index + 1], {});
    }
  });

  return obj;
};

interface FulfillRequestProps {
  chainId: number;
  language: number;
  codeLocation: number;
  source: string;
  publicArgs: object;
  privateArgs: object;
  commitment: string;
  requestId: string;
}

export const fulfillRequest = async (data: FulfillRequestProps) => {
  const { result } = (await fetch('/api/fulfill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }).then((d) => d.json())) as { result: { response: string } };
  return result;
};

export const getRequestEventLogs = async ({ chainId }: { chainId: number }) => {
  const address =
    chainId === localFhenix.id
      ? (env.NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS as `0x${string}`)
      : (env.NEXT_PUBLIC_FHENIX_HELIUM_COORDINATOR_ADDRESS as `0x${string}`);
  const chain = chainId === localFhenix.id ? localFhenix : fhenixHelium;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const filter = await publicClient.createEventFilter({
    address,
    event: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'requestId',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'requestingContract',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'requestInitiator',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'uint64',
          name: 'subscriptionId',
          type: 'uint64',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'subscriptionOwner',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
        {
          indexed: false,
          internalType: 'uint64',
          name: 'callbackGasLimit',
          type: 'uint64',
        },
        {
          components: [
            {
              internalType: 'bytes32',
              name: 'requestId',
              type: 'bytes32',
            },
            {
              internalType: 'address',
              name: 'coordinator',
              type: 'address',
            },
            {
              internalType: 'address',
              name: 'client',
              type: 'address',
            },
            {
              internalType: 'uint64',
              name: 'subscriptionId',
              type: 'uint64',
            },
            {
              internalType: 'uint32',
              name: 'callbackGasLimit',
              type: 'uint32',
            },
            {
              internalType: 'uint32',
              name: 'timeoutTimestamp',
              type: 'uint32',
            },
          ],
          indexed: false,
          internalType: 'struct OracleResponse.Commitment',
          name: 'commitment',
          type: 'tuple',
        },
      ],
      name: 'RequestSent',
      type: 'event',
    },
  });
  const allLogs = await publicClient.getFilterLogs({ filter });

  const logs = allLogs.at(allLogs.length - 1);

  if (!logs) {
    throw new Error('No logs found');
  }
  return logs;
};

export const getRequestStartLogs = async ({ chainId }: { chainId: number }) => {
  const address =
    chainId === localFhenix.id
      ? (env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS as `0x${string}`)
      : (env.NEXT_PUBLIC_FHENIX_HELIUM_ROUTER_ADDRESS as `0x${string}`);
  const chain = chainId === localFhenix.id ? localFhenix : fhenixHelium;

  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });

  const filter = await publicClient.createEventFilter({
    address,
    event: {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'bytes32',
          name: 'requestId',
          type: 'bytes32',
        },
        {
          indexed: true,
          internalType: 'uint64',
          name: 'subscriptionId',
          type: 'uint64',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'subscriptionOwner',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'requestingContract',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'address',
          name: 'requestInitiator',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bytes',
          name: 'data',
          type: 'bytes',
        },
        {
          indexed: false,
          internalType: 'uint32',
          name: 'callbackGasLimit',
          type: 'uint32',
        },
      ],
      name: 'RequestStart',
      type: 'event',
    },
  });

  const allLogs = await publicClient.getFilterLogs({ filter });
  const logs = allLogs.at(allLogs.length - 1);
  if (!logs) {
    throw new Error('No logs found');
  }
  return logs;
};

export const encryptUint256 = async ({
  chainId,
  data,
}: {
  chainId: number;
  data: string;
}) => {
  const fhenixProvider = new ethers.JsonRpcProvider(
    chainId === localFhenix.id
      ? localFhenix.rpcUrls.default.http[0]
      : fhenixHelium.rpcUrls.default.http[0]
  );

  const fhenixClient = new FhenixClient({
    // @ts-expect-error -- safe types
    provider: fhenixProvider,
  });
  const encrypted = await fhenixClient.encrypt_uint256(BigInt(data));
  return encrypted;
};

export const getPermission = async ({
  chainId,
  contractAddress,
  signer,
}: {
  chainId: number;
  address: string;
  contractAddress: string;
  signer: Signer;
  provider: Provider;
}) => {
  const provider = new BrowserProvider(window.ethereum);
  const fhenixClient = new FhenixClient({ provider });
  const permit = await getPermit(contractAddress, provider);
  if (!permit) {
    throw new Error('No permit found');
  }

  return fhenixClient.extractPermitPermission(permit);
};

export const unsealValue = ({
  chainId,
  contractAddress,
  data,
}: {
  chainId: number;
  contractAddress: string;
  data: string;
}) => {
  const fhenixProvider = new ethers.JsonRpcProvider(
    chainId === localFhenix.id
      ? localFhenix.rpcUrls.default.http[0]
      : fhenixHelium.rpcUrls.default.http[0]
  );

  const fhenixClient = new FhenixClient({
    // @ts-expect-error -- safe types
    provider: fhenixProvider,
  });
  const unsealedValue = fhenixClient.unseal(contractAddress, data);
  return unsealedValue;
};
