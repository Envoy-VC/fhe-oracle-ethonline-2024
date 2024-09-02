import { decodeAllSync, encodeAsync } from 'cbor';
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
    city: 'London',
  });

  return fromBytes(encrypted, 'hex');
};

export const encodeData = async (data: object) => {
  const cbor = await encodeAsync(data);
  return toHex(cbor);
};

export const decryptData = async (data: string) => {
  const decodedData = decodeAllSync(toBytes(data));
  const res = decodedData[0] as unknown;

  const { result } = (await fetch('/api/decrypt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: JSON.stringify(res) }),
  }).then((d) => d.json())) as {
    result: string;
  };

  return result;
};

export const getRequestEventLogs = async ({ chainId }: { chainId: number }) => {
  const address =
    chainId === localFhenix.id
      ? env.NEXT_PUBLIC_LOCALFHENIX_COORDINATOR_ADDRESS
      : env.NEXT_PUBLIC_FHENIX_HELIUM_COORDINATOR_ADDRESS;
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
