'use client';

import React from 'react';

import { getAllProcessedRequests, getAllRequests } from '~/lib/graphql';

import { useQuery } from '@tanstack/react-query';
import { useChainId } from 'wagmi';

import { RequestsTable } from './requests-table';
import { ResponseTable } from './response-table';

export const Statistics = () => {
  const chainId = useChainId();
  const { data } = useQuery({
    queryKey: ['getAllRequests', chainId],
    queryFn: async () => {
      const requests = await getAllRequests({ chainId });
      const responses = await getAllProcessedRequests({ chainId });
      return { requests, responses };
    },
  });

  return (
    <section className='flex min-h-[60dvh] w-full flex-col gap-8 rounded-[3rem] bg-[#F1F2FD] p-4 py-12 md:px-12 md:py-12'>
      <div className='text-2xl font-medium sm:text-3xl md:text-4xl'>
        Statistics
      </div>
      <div className='flex w-full flex-col gap-6'>
        <div className='flex w-full flex-col gap-4'>
          <div className='text-xl font-medium sm:text-xl md:text-2xl'>
            Latest Requests
          </div>
          <RequestsTable data={data?.requests ?? []} />
        </div>
        <div className='flex w-full flex-col gap-4'>
          <div className='text-xl font-medium sm:text-xl md:text-2xl'>
            Latest Responses
          </div>
          <ResponseTable data={data?.responses ?? []} />
        </div>
      </div>
    </section>
  );
};
