'use client';

import React, { useState } from 'react';

import { consumerAbi, consumerByteCode } from '~/lib/code';
import { errorHandler } from '~/lib/utils';

import { useAccount, useDeployContract } from 'wagmi';

import { Button } from '../ui/button';

export const DeployContract = () => {
  const [consumerAddress, setConsumerAddress] = useState<string | null>(null);
  const { address } = useAccount();
  const { deployContractAsync, isPending } = useDeployContract();

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
      setConsumerAddress(res);
    } catch (error) {
      errorHandler(error);
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
        <span className='font-medium'>Consumer Address: {consumerAddress}</span>
      ) : null}
    </div>
  );
};
