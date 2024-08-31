import React from 'react';

export const Hero = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-[#272528] text-[#FFFFFF]'>
      <div className='relative overflow-hidden rounded-2xl bg-gradient-to-b from-transparent to-white/10 shadow-sm'>
        <div className='rounded-2xl border border-white/5 p-1'>
          <div className='flex items-baseline gap-[0.20em] rounded-xl border border-white/5 bg-transparent px-3 py-2 text-xl text-white lg:text-2xl'>
            <span className='font-normal text-red-500'>1.21B</span>Total Value
            Secured
          </div>
        </div>
        <span className='z-2 bg-gray-400 absolute -right-6 -top-5 h-10 w-10 opacity-50 blur-md'></span>
        <span className='z-2 bg-gray-400 absolute -bottom-8 -left-7 h-10 w-10 opacity-50 blur-md'></span>
      </div>
    </div>
  );
};
