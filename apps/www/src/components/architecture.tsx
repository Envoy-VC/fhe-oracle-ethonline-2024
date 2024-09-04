import Image from 'next/image';

import React from 'react';

import ArchitectureDiagram from 'public/architecture.png';

export const Architecture = () => {
  return (
    <section
      className='hero-bg flex min-h-[60dvh] w-full flex-col gap-8 rounded-[3rem] p-4 py-4 md:px-12 md:py-12'
      id='architecture'
    >
      <Image
        alt='Architecture Diagram'
        className='w-full max-w-screen-xl !rounded-3xl'
        src={ArchitectureDiagram}
        width={1200}
      />
    </section>
  );
};
