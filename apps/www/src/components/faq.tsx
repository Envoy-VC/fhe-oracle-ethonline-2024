'use client';

import React, { useState } from 'react';

import { type Variants, motion } from 'framer-motion';

import { AnimateChangeInHeight } from './animate-height';

export const Faq = () => {
  return (
    <section
      className='flex min-h-[60dvh] w-full flex-row gap-8 rounded-[3rem] bg-[#F1F2FD] p-4 py-12 md:px-12 md:py-12'
      id='faq'
    >
      <div className='basis-1/3 text-2xl sm:text-3xl md:text-4xl'>FAQs</div>
      <div className='flex w-full basis-2/3 flex-col gap-6'>
        <FAQCard
          answer='FHE is a type of encryption that allows for computations to be performed directly on encrypted data without decrypting it first. This ensures that data remains private and secure throughout the entire process.'
          question='What is Fully Homomorphic Encryption (FHE)?'
        />
        <FAQCard
          answer='FHE Oracle can handle any type of data as they are executed inside a Lit Action. This means that you can fetch or compute over any data source, including APIs, databases, and more.'
          question='What types of data can FHE Oracle handle?'
        />
        <FAQCard
          answer='Envio provides a powerful indexing mechanism that allows for efficient and scalable data access. This means that you ca get access to historic data quickly and easily.'
          question='How does Envio improve data access efficiency?'
        />
        <FAQCard
          answer='No, FHE Oracle is only supported on Fhenix Network. However, it is possible use it with Cross-Chain Bridges to interact with other blockchains.'
          question='Is FHE Oracle compatible with other blockchains?'
        />
        <FAQCard
          answer='When users make requests to FHE Oracle, they can include secrets or arguments along with their request. These secrets are encrypted and only decryptable by the oracle handlers. This ensures that sensitive data remains private and secure throughout the entire process.'
          question='How are secrets and arguments handled during data requests?'
        />
        <FAQCard
          answer='Lit Protocol enables FHE Oracle to perform a variety of actions such as Executing blockchain transactions within Lit actions, Signing messages, Fetching data from various sources, Performing computations on encrypted data, And more'
          question='What capabilities does Lit Protocol provide for FHE Oracle?'
        />
      </div>
    </section>
  );
};

interface FAQCardProps {
  question: string;
  answer: string;
}

const FAQCard = ({ question, answer }: FAQCardProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const pathVariants: Variants = {
    open: {
      rotateZ: 90,
    },
    closed: {
      rotateZ: 0,
    },
  };
  return (
    <AnimateChangeInHeight>
      <div className='flex flex-row justify-start gap-4 rounded-3xl bg-white px-5 py-4'>
        <button
          className='flex h-10 min-w-10 items-center justify-center rounded-full bg-[#EDEFF3]'
          type='button'
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            fill='none'
            height='24'
            stroke='#5F57FF'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            viewBox='0 0 24 24'
            width='24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <motion.path
              animate={isOpen ? 'open' : 'closed'}
              d='M12 5v14'
              initial='closed'
              variants={pathVariants}
              transition={{
                ease: 'easeInOut',
                duration: 0.3,
              }}
            />
            <path d='M5 12h14' />
          </svg>
        </button>
        <div className='flex flex-col gap-4'>
          <div className='mt-1 text-2xl font-medium'>{question}</div>
          {isOpen ? (
            <div className='text-sm font-medium text-neutral-500'>{answer}</div>
          ) : null}
        </div>
      </div>
    </AnimateChangeInHeight>
  );
};
