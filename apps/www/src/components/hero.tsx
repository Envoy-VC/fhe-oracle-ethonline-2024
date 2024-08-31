import Image from 'next/image';

import React from 'react';

import Logo from 'public/icon.svg';

import { DiamondIcon } from 'lucide-react';

export const Hero = () => {
  return (
    <div className='relative flex min-h-screen w-full flex-col items-center justify-center gap-12'>
      <div className='mx-4 flex w-full max-w-[1400px] flex-col gap-12'>
        <div className='hero-bg relative mx-4 my-12 h-[60dvh] w-full rounded-[3rem]'>
          <div className='absolute left-0 top-8 flex w-full justify-between px-8'>
            <div className='flex flex-row items-center gap-3 text-xl font-medium text-white'>
              <Image
                alt='FHE Oracle Logo'
                height={32}
                src={Logo as unknown as string}
                width={32}
              />
              FHE Oracle
            </div>
            <div className='rounded-full border-2 border-[#5F57FF] bg-[#655EFF] px-4 py-1 font-medium text-white shadow-sm transition-colors duration-300 ease-in-out hover:border-[#212121] hover:bg-[#2a2a2a]'>
              Get Started
            </div>
          </div>
          <div className='absolute top-1/2 flex w-full -translate-y-1/2 flex-col items-center justify-center gap-6 px-4 text-center text-white'>
            <div className='flex flex-row items-center gap-2 rounded-full bg-white px-4 py-[2px] text-sm font-medium text-neutral-700'>
              <DiamondIcon fill='#404040' size={12} />
              First FHE powered Data Oracle
            </div>
            <h1 className='text-7xl font-medium'>
              Securely Compute,
              <br /> Privately Fetch
            </h1>
            <p className='max-w-3xl text-sm'>
              FHE Oracle is a fully homomorphic encryption-powered data oracle
              on Fhenix blockchain. Computes or fetches data using Lit Protocol
              actions and is indexed using Envio.
            </p>
          </div>
          <iframe
            className='h-full w-full overflow-hidden rounded-[3rem] border-none'
            loading='lazy'
            referrerPolicy='no-referrer'
            sandbox='allow-same-origin allow-scripts allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-storage-access-by-user-activation allow-top-navigation-by-user-activation'
            src='https://my.spline.design/untitled-e0e807542552f95e92e67ab9e1801788/'
            title='FHE Oracle'
          />
        </div>
        <div className='mx-4 h-[60dvh] w-full rounded-[3rem] bg-[#F1F2FD]'>
          a
        </div>
      </div>
    </div>
  );
};
