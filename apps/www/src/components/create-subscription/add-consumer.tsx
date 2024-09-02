'use client';

import React, { useEffect, useState } from 'react';

import { errorHandler } from '~/lib/utils';
import { routerAbi } from '~/lib/viem/abi';

import { toast } from 'sonner';
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { env } from '~/env';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const AddConsumer = () => {
  const [consumerAddress, setConsumerAddress] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<number | null>();
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync, data, isPending } = useWriteContract();

  const result = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (result.data) {
      toast.success('Consumer added successfully');
    }
  }, [result.data]);

  const onAdd = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }
      if (!subscriptionId) {
        throw new Error('Subscription Id is required');
      }
      const router =
        chainId === 412346
          ? env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS
          : env.NEXT_PUBLIC_FHENIX_HELIUM_ROUTER_ADDRESS;

      const hash = await writeContractAsync({
        abi: routerAbi,
        address: router as `0x${string}`,
        functionName: 'addConsumer',
        args: [BigInt(subscriptionId), consumerAddress as `0x${string}`],
      });
      console.log(hash);
    } catch (error) {
      toast.error(errorHandler(error));
    }
    // 0xe86b1899376c77e1a109ea2124e462ef58e56897
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 3:</div>
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
      <Button
        className='h-12 text-base'
        disabled={isPending || !subscriptionId || !consumerAddress}
        size='primary'
        variant='primary'
        onClick={onAdd}
      >
        Add Consumer
      </Button>
    </div>
  );
};
