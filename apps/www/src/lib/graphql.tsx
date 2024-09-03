import { env } from '~/env';
import type { RequestProcessedEvent, RequestSentEvent } from '~/types';

import { localFhenix } from './viem/chains';

interface BaseProps {
  chainId: number;
}

export type RequestSentEventResponse = Awaited<
  ReturnType<typeof getAllRequests>
>[number];

export const getAllRequests = async ({ chainId }: BaseProps) => {
  const query = `
    query GetAllRequest {
      OracleCoordinator_RequestSent(order_by: { db_write_timestamp: asc }) {
        id
        requestId
        data
        requestInitiator
        requestingContract
        subscriptionId
        subscriptionOwner
        callbackGasLimit
        commitment_0
        commitment_1
        commitment_2
        commitment_3
        commitment_4
        commitment_5
      }
    }
  `;

  const url =
    chainId === localFhenix.id
      ? env.NEXT_PUBLIC_LOCAL_HASURA_GRAPHQL_URL
      : env.NEXT_PUBLIC_HELIUM_HASURA_GRAPHQL_URL;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = (await res.json()) as RequestSentEvent;

  return data.data.OracleCoordinator_RequestSent.map((d) => {
    return {
      id: d.id,
      requestId: d.requestId,
      data: d.data,
      requestInitiator: d.requestInitiator,
      requestingContract: d.requestingContract,
      subscriptionId: d.subscriptionId,
      subscriptionOwner: d.subscriptionOwner,
      callbackGasLimit: d.callbackGasLimit,
      commitment: {
        requestId: d.commitment_0,
        coordinator: d.commitment_1,
        client: d.commitment_2,
        subscriptionId: d.commitment_3,
        callbackGasLimit: d.commitment_4,
        timeoutTimestamp: d.commitment_5,
      },
    };
  });
};

export type RequestProcessedEventResponse = Awaited<
  ReturnType<typeof getAllProcessedRequests>
>[number];

export const getAllProcessedRequests = async ({ chainId }: BaseProps) => {
  const query = `
    query GetAllProcessedRequest {
      OracleRouter_RequestProcessed(order_by: { db_write_timestamp: asc }) {
        id
        requestId
        subscriptionId
        resultCode
        response
        err
        transmitter
      }
    }
  `;

  const url =
    chainId === localFhenix.id
      ? env.NEXT_PUBLIC_LOCAL_HASURA_GRAPHQL_URL
      : env.NEXT_PUBLIC_HELIUM_HASURA_GRAPHQL_URL;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = (await res.json()) as RequestProcessedEvent;

  return data.data.OracleRouter_RequestProcessed;
};
