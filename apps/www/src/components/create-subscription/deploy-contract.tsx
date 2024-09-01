'use client';

import React from 'react';

import { consumerByteCode } from '~/lib/code';
import { errorHandler } from '~/lib/utils';
import { consumerAbi } from '~/lib/viem/abi';

import { toast } from 'sonner';
import {
  useAccount,
  useChainId,
  useDeployContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { env } from '~/env';

import { Button } from '../ui/button';
import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';

export const DeployContract = () => {
  const { address } = useAccount();
  const { deployContractAsync, isPending, data } = useDeployContract();
  const chainId = useChainId();

  const result = useWaitForTransactionReceipt({
    hash: data,
  });

  const onDeploy = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }

      console.log(env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS);

      const router =
        chainId === 412346
          ? env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS
          : env.NEXT_PUBLIC_FHENIX_HELIUM_ROUTER_ADDRESS;

      await deployContractAsync({
        bytecode: consumerByteCode,
        abi: consumerAbi,
        args: [router as `0x${string}`],
      });
    } catch (error) {
      const message = errorHandler(error);
      toast.error(message);
    }
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 1:</div>
      <Button
        className='h-12 text-base'
        disabled={isPending}
        size='primary'
        variant='primary'
        onClick={onDeploy}
      >
        {isPending ? 'Deploying...' : 'Deploy Consumer Contract'}
      </Button>
      {result.data?.contractAddress ? (
        <span className='flex items-center gap-2 font-medium'>
          Consumer Address:
          <TextCopy
            text={result.data.contractAddress}
            truncateOptions={{ enabled: true, length: 20, fromMiddle: true }}
            type='text'
          >
            <TextCopyContent />
            <TextCopyButton />
          </TextCopy>
        </span>
      ) : null}
    </div>
  );
};
