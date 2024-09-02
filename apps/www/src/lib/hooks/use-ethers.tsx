/* eslint-disable @typescript-eslint/no-unsafe-argument -- safe */
import { useMemo } from 'react';

import {
  BrowserProvider,
  FallbackProvider,
  JsonRpcProvider,
  JsonRpcSigner,
} from 'ethers';
import type { Account, Chain, Client, Transport } from 'viem';
import { useClient, useConnectorClient } from 'wagmi';

export function clientToProvider(client: Client<Transport, Chain>) {
  const { chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback') {
    const providers = (transport.transports as ReturnType<Transport>[]).map(
      ({ value }) => new JsonRpcProvider(value?.url, network)
    );
    if (providers.length === 1) return providers[0];
    return new FallbackProvider(providers);
  }
  return new JsonRpcProvider(transport.url, network);
}

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new BrowserProvider(transport, network);
  const signer = new JsonRpcSigner(provider, account.address);
  return signer;
}

export function useEthers({ chainId }: { chainId?: number } = {}) {
  const pClient = useClient({ chainId });
  const provider = useMemo(
    () => (pClient ? clientToProvider(pClient) : undefined),
    [pClient]
  );

  const { data: client } = useConnectorClient({ chainId });
  const signer = useMemo(
    () => (client ? clientToSigner(client) : undefined),
    [client]
  );

  return { provider, signer };
}
