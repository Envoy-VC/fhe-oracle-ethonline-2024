'use client';

import React, { useEffect, useState } from 'react';

import { errorHandler } from '~/lib/utils';
import { routerAbi } from '~/lib/viem/abi';

import { toast } from 'sonner';
import { hexToNumber } from 'viem';
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi';
import { env } from '~/env';

import { Button } from '../ui/button';

export const CreateSubscription = () => {
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const chainId = useChainId();
  const { address } = useAccount();
  const { writeContractAsync, data, isPending } = useWriteContract();

  const result = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (result.data) {
      const id = result.data.logs[0]?.topics[1];
      if (id) {
        setSubscriptionId(hexToNumber(id));
        toast.success('Subscription created successfully');
      }
    }
  }, [result.data]);

  const onCreate = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }
      const router =
        chainId === 412346
          ? env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS
          : env.NEXT_PUBLIC_FHENIX_HELIUM_ROUTER_ADDRESS;

      const hash = await writeContractAsync({
        abi: routerAbi,
        address: router as `0x${string}`,
        functionName: 'createSubscription',
      });
      console.log(hash);
    } catch (error) {
      toast.error(errorHandler(error));
    }
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 2:</div>
      <Button
        className='h-12 text-base'
        disabled={isPending}
        size='primary'
        variant='primary'
        onClick={onCreate}
      >
        {isPending ? 'Creating...' : 'Create Subscription'}
      </Button>
      {subscriptionId ? (
        <span className='font-medium'>Subscription Id: {subscriptionId}</span>
      ) : null}
    </div>
  );
};
