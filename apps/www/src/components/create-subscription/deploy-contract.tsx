'use client';

import React, { useState } from 'react';

import { consumerAbi, consumerByteCode } from '~/lib/code';
import { errorHandler } from '~/lib/utils';

import { toast } from 'sonner';
import {
  useAccount,
  useDeployContract,
  useWaitForTransactionReceipt,
} from 'wagmi';

import { Button } from '../ui/button';
import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';

export const DeployContract = () => {
  const { address } = useAccount();
  const { deployContractAsync, isPending, data } = useDeployContract();

  const result = useWaitForTransactionReceipt({
    hash: data,
  });

  const onDeploy = async () => {
    try {
      if (!address) {
        throw new Error('No account found');
      }
      const res = await deployContractAsync({
        bytecode: consumerByteCode,
        abi: consumerAbi,
        args: ['0x49297bbf75740C8BEB93F7d19520De05514072A9'],
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
