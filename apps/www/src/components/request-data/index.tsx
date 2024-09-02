'use client';

import React, { useEffect, useRef, useState } from 'react';

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
      <div className='flex w-full flex-col gap-6 md:flex-row'>
        <div className='flex w-full basis-1/3 flex-col gap-6 md:flex-row'>
          <CreateRequest append={append} />
        </div>
        <div className='flex w-full basis-2/3 flex-col gap-2'>
          <div
            ref={containerRef}
            className='flex h-full max-w-3xl overflow-x-scroll whitespace-pre rounded-3xl border bg-[#EFF1F5] p-2'
          >
            {data}
          </div>
        </div>
      </div>
    </section>
  );
};
