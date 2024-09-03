'use client';

import Link from 'next/link';

import React, { useEffect, useRef, useState } from 'react';

import { ScrollArea } from '../ui/scroll-area';
import { TextCopy, TextCopyButton, TextCopyContent } from '../ui/text-copy';
import { CreateRequest } from './create-request';

export const RequestData = () => {
  const [data, setData] = useState<string>('');

  const append = (newData: string) => {
    setData((prevData) => prevData + newData);
  };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }, [data]);

  return (
    <section className='flex min-h-[60dvh] w-full flex-col gap-8 rounded-[3rem] bg-[#F1F2FD] p-4 py-12 md:px-12 md:py-12'>
      <div className='text-2xl font-medium sm:text-3xl md:text-4xl'>
        Request Data (Weather API Example)
      </div>
      <div className='flex flex-col'>
        <div className='flex flex-row items-center gap-2'>
          <span className='font-medium'>Fhenix Helium Consumer Address:</span>{' '}
          <TextCopy
            text='0x394403eE9b3b5e25D492Ad2FD4cc0836D8e75B52'
            truncateOptions={{ enabled: true, length: 20, fromMiddle: true }}
            type='text'
          >
            <TextCopyContent />
            <TextCopyButton />
          </TextCopy>
        </div>
        <div>
          <span className='font-medium'>Fhenix Helium Subscription Id:</span> 1
        </div>
        <div className='flex flex-row items-center gap-2'>
          <span className='font-medium'> Get API Key from:</span>{' '}
          <Link
            className='text-blue-400'
            href='https://www.weatherapi.com/'
            target='_blank'
          >
            weatherapi.com
          </Link>
        </div>
      </div>
      <div className='flex w-full flex-col gap-6 md:flex-row'>
        <div className='flex w-full basis-1/3 flex-col gap-6 md:flex-row'>
          <CreateRequest append={append} />
        </div>
        <div className='flex w-full basis-2/3 flex-col gap-2'>
          <ScrollArea
            ref={containerRef}
            className='flex h-[50dvh] max-w-3xl overflow-x-scroll whitespace-pre rounded-3xl border bg-[#EFF1F5] p-2'
          >
            {data}
          </ScrollArea>
        </div>
      </div>
    </section>
  );
};
