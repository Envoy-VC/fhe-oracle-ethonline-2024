'use client';

import React, { useState } from 'react';

import { useDeployContract } from 'wagmi';

import { Button } from '../ui/button';

export const DeployContract = () => {
  const [address, setAddress] = useState<string | null>(null);

  const { deployContract } = useDeployContract();

  const onDeploy = () => {
    // TODO: Call contract to deploy consumer contract
    setAddress('0x1234567890');
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 1:</div>
      <Button
        className='h-12 text-base'
        size='primary'
        variant='primary'
        onClick={onDeploy}
      >
        Deploy Consumer Contract
      </Button>
      {address ? (
        <span className='font-medium'>Consumer Address: {address}</span>
      ) : null}
    </div>
  );
};
