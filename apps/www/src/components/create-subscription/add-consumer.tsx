'use client';

import React, { useState } from 'react';

import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const AddConsumer = () => {
  const [consumerAddress, setConsumerAddress] = useState<string>('');

  const onAdd = () => {
    // TODO: Call contract to create a subscription
    // 0xe86b1899376c77e1a109ea2124e462ef58e56897
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 3:</div>
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
        size='primary'
        variant='primary'
        onClick={onAdd}
      >
        Add Consumer
      </Button>
    </div>
  );
};
