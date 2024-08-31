'use client';

import React from 'react';

import {
  Architecture,
  Faq,
  Features,
  FloatingDock,
  Hero,
  Solutions,
} from '~/components';

const Home = () => {
  return (
    <div className='mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-3 overflow-hidden'>
      <Hero />
      <Features />
      <Architecture />
      <Solutions />
      <Faq />
      <FloatingDock />
    </div>
  );
};

export default Home;
