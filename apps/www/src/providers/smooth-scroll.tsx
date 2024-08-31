'use client';

import type { PropsWithChildren } from 'react';

import { ReactLenis } from 'lenis/react';

export const SmoothScrollProvider = ({ children }: PropsWithChildren) => {
  return <ReactLenis root>{children}</ReactLenis>;
};
