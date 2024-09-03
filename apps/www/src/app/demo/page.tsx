import React from 'react';

import {
  CreateSubscription,
  Navbar,
  RequestData,
  Statistics,
} from '~/components';

const Demo = () => {
  return (
    <>
      <Navbar />
      <div className='mx-auto my-24 flex w-full max-w-[1400px] flex-col gap-12 overflow-hidden px-3'>
        <CreateSubscription />
        <RequestData />
        <Statistics />
      </div>
    </>
  );
};

export default Demo;
