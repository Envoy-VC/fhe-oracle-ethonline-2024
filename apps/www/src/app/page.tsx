'use client';

import React from 'react';

import { Architecture, Faq, Features, FloatingDock, Hero } from '~/components';

const Home = () => {
  return (
    <div className='mx-auto flex w-full max-w-[1400px] flex-col gap-12 overflow-hidden px-3 pb-24'>
      <Hero />
      <Features />
      <Architecture />
      <Faq />
      <FloatingDock />
    </div>
  );
};

export default Home;
