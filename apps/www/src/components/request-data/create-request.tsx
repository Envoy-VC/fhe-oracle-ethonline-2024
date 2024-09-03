'use client';

import React, { useState } from 'react';

import {
  decodeData,
  encodeData,
  fulfillRequest,
  getEncryptedData,
  getRequestEventLogs,
  getRequestStartLogs,
  parseJson,
} from '~/lib/helpers';
import { useEthers, usePermission } from '~/lib/hooks';
import { errorHandler } from '~/lib/utils';
import { wagmiConfig } from '~/lib/viem';
import { consumerAbi } from '~/lib/viem/abi';

import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { ethers } from 'ethers';
import { SealingKey } from 'fhenixjs';
import { toast } from 'sonner';
import { toHex } from 'viem';
import { useAccount, useChainId, useWriteContract } from 'wagmi';
import { CodeLocation } from '~/types';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface BaseProps {
  append: (newData: string) => void;
}

export const CreateRequest = ({ append }: BaseProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [consumerAddress, setConsumerAddress] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);

  const { address } = useAccount();
  const chainId = useChainId();
  const { writeContractAsync } = useWriteContract();
  const { signer, provider } = useEthers({ chainId });
  const { getPermit } = usePermission();

  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const onRequest = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }
      if (apiKey === '') {
        throw new Error('API Key is required');
      }
      if (location === '') {
        throw new Error('Location is required');
      }
      if (consumerAddress === '') {
        throw new Error('Consumer Address is required');
      }
      if (!subscriptionId) {
        throw new Error('Subscription Id is required');
      }

      setIsRequesting(true);

      const id = BigInt(subscriptionId);
      const source = 'ipfs://QmZg8YbrJh92gtya21XQETS72DB7gYjQTQon2Npg4RUtfp';
      const codeLocation = CodeLocation.IPFS;

      append(
        `Requesting data for Subscription Id: ${String(subscriptionId)}\n`
      );
      append(`Public Arguments: ${JSON.stringify({ city: location })}\n`);
      append(`Private Arguments: ${JSON.stringify({ apiKey })}\n`);
      const publicArgs = await encodeData({ city: location });
      append(`Encoded Public Arguments: ${publicArgs}\n\n`);

      append(`⏳ Encrypting Private Arguments\n`);

      const privateArgs = await getEncryptedData('apiKey', apiKey, source);
      append(`✅ Encrypted Private Arguments: \n\n${privateArgs}\n\n`);
      append(`⏳ Sending Request\n`);

      const hash = await writeContractAsync({
        abi: consumerAbi,
        address: consumerAddress as `0x${string}`,
        functionName: 'sendRequest',
        args: [id, source, codeLocation, publicArgs, privateArgs, 30000000],
      });

      append(`✅ Request Sent\nTransaction Hash: ${hash}\n`);

      await waitForTransactionReceipt(wagmiConfig, { hash });
      const logs = await getRequestEventLogs({ chainId });
      const dataLogs = await getRequestStartLogs({ chainId });
      append(`✅ Request Id: ${logs.args.requestId ?? ''}\n\n`);
      append(`⏳ Waiting for Request Fulfillment\n`);

      if (!logs.args.commitment) {
        throw new Error('No commitment found');
      }

      const commitment = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes32', 'address', 'address', 'uint64', 'uint32', 'uint32'],
        [
          logs.args.commitment.requestId,
          logs.args.commitment.coordinator,
          logs.args.commitment.client,
          logs.args.commitment.subscriptionId,
          logs.args.commitment.callbackGasLimit,
          logs.args.commitment.timeoutTimestamp,
        ]
      );
      const data = parseJson(decodeData(dataLogs.args.data ?? ''), {}) as {
        language: bigint;
        codeLocation: bigint;
        source: string;
        publicArgs: Uint8Array;
        privateArgs: Uint8Array;
      };

      const publicParams = decodeData(toHex(data.publicArgs))[0] as object;
      const privateParams = decodeData(toHex(data.privateArgs))[0] as object;

      await fulfillRequest({
        chainId,
        language: Number(data.language),
        codeLocation: Number(data.codeLocation),
        source: data.source,
        publicArgs: publicParams,
        privateArgs: privateParams,
        commitment,
        requestId: logs.args.commitment.requestId,
      });
      append(`✅ Request Fulfilled\n\n`);
    } catch (error) {
      const e = errorHandler(error);
      toast.error(e);
      append(`\n\n❌ Error: ${e}\n\n`);
    } finally {
      setIsRequesting(false);
    }
  };
  return (
    <div className='flex w-full flex-col gap-2'>
      <Input
        autoComplete='off'
        className='rounded-full border-none'
        placeholder='Subscription Id'
        type='number'
        value={subscriptionId ?? 0}
        onChange={(e) => setSubscriptionId(parseInt(e.target.value))}
      />
      <Input
        autoComplete='off'
        className='rounded-full border-none'
        placeholder='Consumer Address'
        type='text'
        value={consumerAddress}
        onChange={(e) => setConsumerAddress(e.target.value)}
      />
      <Input
        autoComplete='off'
        className='rounded-full border-none'
        placeholder='API Key (will be encrypted)'
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
      />
      <Input
        autoComplete='off'
        className='rounded-full border-none'
        placeholder='Location (eg- London, Paris)'
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <Button
        className='mt-4 h-12 text-base'
        size='primary'
        variant='primary'
        disabled={
          isRequesting ||
          !subscriptionId ||
          !consumerAddress ||
          !address ||
          !apiKey ||
          !location
        }
        onClick={onRequest}
      >
        Request Data
      </Button>

      <Button
        className='h-12 text-base'
        disabled={!consumerAddress}
        size='primary'
        variant='primary'
        onClick={async () => {
          const res = await readContract(wagmiConfig, {
            abi: consumerAbi,
            address: consumerAddress as `0x${string}`,
            functionName: 's_lastRequestId',
          });
          append(`✅ Last Request Id: ${res.toString()}\n`);
        }}
      >
        Get Last Request Id
      </Button>

      <Button
        className='h-12 text-base'
        disabled={!consumerAddress}
        size='primary'
        variant='primary'
        onClick={async () => {
          const res = await readContract(wagmiConfig, {
            abi: consumerAbi,
            address: consumerAddress as `0x${string}`,
            functionName: 'lastResponse',
          });
          append(`✅ Last Response: ${res.toString()}\n`);
        }}
      >
        Get Last Response
      </Button>

      <Button
        className='h-12 text-base'
        disabled={isRequesting || !consumerAddress}
        size='primary'
        variant='primary'
        onClick={async () => {
          try {
            if (!signer || !provider) {
              throw new Error('No signer or provider found');
            }
            if (!address) {
              throw new Error('No account found');
            }
            const permit = await getPermit(consumerAddress as `0x${string}`);
            const sealedValue = await readContract(wagmiConfig, {
              abi: consumerAbi,
              address: consumerAddress as `0x${string}`,
              functionName: 'getLastResponse',
              args: [
                {
                  publicKey: permit.publicKey as `0x${string}`,
                  signature: permit.signature as `0x${string}`,
                },
              ],
            });

            const sealingKey = new SealingKey(
              permit.sealingKey.privateKey,
              permit.sealingKey.publicKey
            );

            const unsealed = sealingKey.unseal(sealedValue);
            append(`✅ Unsealed Response: ${unsealed.toString()}\n`);
          } catch (error) {
            toast.error(errorHandler(error));
          }
        }}
      >
        Unseal Last Response
      </Button>
    </div>
  );
};
