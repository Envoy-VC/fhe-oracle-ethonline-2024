'use client';

import React, { useState } from 'react';

import { Button } from '../ui/button';

export const CreateSubscription = () => {
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const onCreate = () => {
    // TODO: Call contract to create a subscription
    setSubscriptionId('4');
  };
  return (
    <div className='flex flex-col gap-2'>
      <div className='px-1 text-lg font-medium text-neutral-500'>Step 2:</div>
      <Button
        className='h-12 text-base'
        size='primary'
        variant='primary'
        onClick={onCreate}
      >
        Create Subscription
      </Button>
      {subscriptionId ? (
        <span className='font-medium'>Subscription Id: {subscriptionId}</span>
      ) : null}
    </div>
  );
};
