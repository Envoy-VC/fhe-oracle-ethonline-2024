import Image from 'next/image';
import Link from 'next/link';

import React, { type ComponentProps } from 'react';

import { cn } from '~/lib/utils';

import GridBG from 'public/grid.svg';

export const Features = () => {
  return (
    <section
      className='flex min-h-[60dvh] w-full flex-col gap-8 rounded-[3rem] bg-[#F1F2FD] p-4 py-12 md:px-12 md:py-12'
      id='features'
    >
      <div className='w-fit rounded-full border border-neutral-700 bg-white px-3 py-1 text-sm text-neutral-800'>
        Features
      </div>
      <div className='text-3xl sm:text-5xl'>Features of FHE Oracle</div>
      <div className='flex min-h-[24rem] flex-col gap-6 md:flex-row'>
        <FeatureCard
          className='basis-1/2 !py-12'
          description='FHE Oracle leverages fully homomorphic encryption (FHE) to ensure the privacy of your data. This means oracle returned data in in encrypted format and only data is decrypted inside a Lit action. This means no one can see your data.'
          title='Fully Homomorphic Encryption'
        >
          <div className='absolute left-6 hidden md:bottom-12 md:block'>
            <Link
              className='rounded-full border-2 border-[#5F57FF] bg-[#655EFF] px-4 py-2 font-medium text-white shadow-sm transition-colors duration-300 ease-in-out hover:border-[#212121] hover:bg-[#2a2a2a]'
              href='/demo'
            >
              Get Started
            </Link>
          </div>
        </FeatureCard>
        <div className='flex basis-1/2 flex-col gap-6'>
          <FeatureCard
            className='h-full'
            description='Lit Protocol actions allow FHE Oracle to securely fetch or compute over any data source. This flexibility enables developers to build a wide range of applications that require private and secure data access.'
            title='Fetch or Compute Over Any Data Source '
          />
          <FeatureCard
            className='h-full'
            description='Envio provides a powerful indexing mechanism for FHE Oracle. This allows for efficient and scalable data access along with historic data retrieval.'
            title='Indexed Data Access'
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps extends ComponentProps<'div'> {
  title?: string;
  description?: React.ReactNode;
}

const FeatureCard = ({
  title,
  description,
  className,
  children,
  ...props
}: FeatureCardProps) => {
  return (
    <div
      className={cn(
        'relative flex w-full flex-col gap-4 overflow-hidden rounded-3xl bg-white p-4',
        className
      )}
      {...props}
    >
      <div className='text-xl font-medium sm:text-3xl'>{title}</div>
      <p className='text-sm font-medium text-neutral-500'>{description}</p>
      <Image
        alt='Grid'
        className='absolute bottom-0 left-0 translate-y-1/3'
        height={1000}
        src={GridBG as unknown as string}
        width={1000}
      />
      {children}
    </div>
  );
};
