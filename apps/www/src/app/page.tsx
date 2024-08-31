'use client';

import React from 'react';

import { Hero } from '~/components';

import { Button } from '~/components/ui/button';

const Home = () => {
  return (
    <div>
      <Hero />
      <Button
        onClick={async () => {
          const res = await fetch('/api/fulfill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: 'Hello, World!',
            }),
          });

          const data = await res.json();
          console.log(data);
        }}
      >
        Run Action
      </Button>
    </div>
  );
};

export default Home;
