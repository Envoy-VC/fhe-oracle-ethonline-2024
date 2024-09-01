import Image from 'next/image';

import React from 'react';

import Logo from 'public/favicon.svg';

import { ConnectButton } from './connect-button';

export const Navbar = () => {
  return (
    <div className='h-[6dvh] w-full border'>
      <div className='mx-auto flex h-full max-w-screen-xl items-center justify-between px-4'>
        <div className='flex flex-row items-center gap-3 text-xl font-medium text-neutral-700'>
          <Image
            alt='FHE Oracle Logo'
            height={32}
            src={Logo as unknown as string}
            width={32}
          />
          FHE Oracle
        </div>
        <ConnectButton />
      </div>
    </div>
  );
};
