import React from 'react';

import { CreateSubscription, RequestData } from '~/components';

const Demo = () => {
  return (
    <div className='mx-auto flex w-full max-w-[1400px] flex-col gap-12 overflow-hidden px-3 py-24'>
      <CreateSubscription />
      <RequestData />
    </div>
  );
};

export default Demo;
