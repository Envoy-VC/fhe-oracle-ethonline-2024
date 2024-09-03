'use client';

import React, { useState } from 'react';

import { consumerByteCode } from '~/lib/code';
import { errorHandler } from '~/lib/utils';
import { wagmiConfig } from '~/lib/viem';
import { consumerAbi } from '~/lib/viem/abi';

import { waitForTransactionReceipt } from '@wagmi/core';
import { toast } from 'sonner';
import { useAccount, useChainId, useDeployContract } from 'wagmi';
import { env } from '~/env';

import { Button } from '../ui/button';
import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';

export const DeployContract = () => {
  const { address } = useAccount();
  const { deployContractAsync, isPending } = useDeployContract();
  const chainId = useChainId();

  const [consumerAddress, setConsumerAddress] = useState<string | null>(null);

  const onDeploy = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }

      const router =
        chainId === 412346
          ? env.NEXT_PUBLIC_LOCALFHENIX_ROUTER_ADDRESS
          : env.NEXT_PUBLIC_FHENIX_HELIUM_ROUTER_ADDRESS;

      const hash = await deployContractAsync({
        bytecode: consumerByteCode,
        abi: consumerAbi,
        args: [router as `0x${string}`],
      });
      const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
      setConsumerAddress(receipt.contractAddress ?? null);
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
      {consumerAddress ? (
        <span className='flex items-center gap-2 font-medium'>
          Consumer Address:
          <TextCopy
            text={consumerAddress}
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
