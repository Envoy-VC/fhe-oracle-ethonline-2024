import { expect } from 'chai';
import { deploy, type FHEOracleState } from '../lib';
import { before } from 'mocha';

describe('Deployments', () => {
  let state: FHEOracleState;
  before(async () => {
    state = await deploy();
  });

  it('should deploy all contracts', async () => {
    const { coordinator, router, consumer } = state;
    expect(await coordinator.getAddress()).to.not.be.undefined;
    expect(await router.getAddress()).to.not.be.undefined;
    expect(await consumer.getAddress()).to.not.be.undefined;
  });
});
