'use client';

import React, { useState } from 'react';

import {
  encodeData,
  getEncryptedData,
  getRequestEventLogs,
} from '~/lib/helpers';
import { errorHandler } from '~/lib/utils';
import { wagmiConfig } from '~/lib/viem';
import { consumerAbi } from '~/lib/viem/abi';

import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { toast } from 'sonner';
import { createThirdwebClient } from 'thirdweb';
import { upload } from 'thirdweb/storage';
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
  const { writeContractAsync, isPending } = useWriteContract();

  const onAdd = async () => {
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

      const id = BigInt(subscriptionId);
      const source = '123';
      const codeLocation = CodeLocation.IPFS;
      const publicArgs = await encodeData({ city: location });
      const privateArgs = await getEncryptedData('apiKey', apiKey);

      const hash = await writeContractAsync({
        abi: consumerAbi,
        address: consumerAddress as `0x${string}`,
        functionName: 'sendRequest',
        args: [id, source, codeLocation, publicArgs, privateArgs, 300000],
      });

      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      const logs = await getRequestEventLogs({ chainId });
    } catch (error) {
      toast.error(errorHandler(error));
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
          isPending ||
          !subscriptionId ||
          !consumerAddress ||
          !address ||
          !apiKey ||
          !location
        }
        onClick={onAdd}
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
            address: consumerAddress,
            functionName: 's_lastRequestId',
          });
          console.log(res);
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
            address: consumerAddress,
            functionName: 's_lastResponse',
          });
          console.log(res);
        }}
      >
        Get Last Response
      </Button>
      <Button
        className='h-12 text-base'
        // disabled={isPending || !subscriptionId || !consumerAddress}
        size='primary'
        variant='primary'
      >
        Unseal Last Response
      </Button>
      <Button
        onClick={() => {
          const client = createThirdwebClient({
            clientId: '',
          });
          const hash = upload({ client, files: [``] });
        }}
      >
        Upload
      </Button>
    </div>
  );
};
