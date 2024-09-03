export enum CodeLocation {
  Inline = 0,
  IPFS = 1,
}

export interface RequestSentEvent {
  data: {
    OracleCoordinator_RequestSent: {
      id: string;
      requestId: string;
      data: string;
      requestInitiator: string;
      requestingContract: string;
      subscriptionId: string;
      subscriptionOwner: string;
      callbackGasLimit: string;
      commitment_0: string;
      commitment_1: string;
      commitment_2: string;
      commitment_3: string;
      commitment_4: string;
      commitment_5: string;
    }[];
  };
}

export interface RequestProcessedEvent {
  data: {
    OracleRouter_RequestProcessed: {
      id: string;
      requestId: string;
      subscriptionId: string;
      resultCode: string;
      response: string;
      err: string;
      transmitter: string;
    }[];
  };
}
