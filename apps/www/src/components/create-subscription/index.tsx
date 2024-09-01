import React from 'react';

import { consumerCode } from '~/lib/code';

import { codeToHtml } from 'shiki';

import { ScrollArea } from '~/components/ui/scroll-area';

import { AddConsumer } from './add-consumer';
import { CreateSubscription as CreateSubscriptionButton } from './create-button';
import { DeployContract } from './deploy-contract';

const CodeBlock = async () => {
  const out = await codeToHtml(consumerCode, {
    lang: 'solidity',
    theme: 'catppuccin-latte',
  });

  return <div dangerouslySetInnerHTML={{ __html: out }} />;
};

export const CreateSubscription = () => {
  return (
    <section className='flex min-h-[60dvh] w-full flex-col gap-8 rounded-[3rem] bg-[#F1F2FD] p-4 py-12 md:px-12 md:py-12'>
      <div className='text-2xl sm:text-3xl md:text-4xl font-medium'>
        Create Subscription
      </div>
      <div className='flex w-full flex-col gap-6 md:flex-row'>
        <div className='flex w-full basis-1/3 flex-col gap-3 py-8'>
          <DeployContract />
          <CreateSubscriptionButton />
          <AddConsumer />
        </div>
        <ScrollArea className='h-[50dvh] w-full basis-2/3 rounded-3xl bg-[#EFF1F5] p-4'>
          <CodeBlock />
        </ScrollArea>
      </div>
    </section>
  );
};
