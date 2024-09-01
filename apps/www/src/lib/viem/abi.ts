export const routerAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_coordinator',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint16',
            name: 'maxConsumersPerSubscription',
            type: 'uint16',
          },
          {
            internalType: 'bytes4',
            name: 'handleOracleFulfillmentSelector',
            type: 'bytes4',
          },
          {
            internalType: 'uint16',
            name: 'gasForCallExactCheck',
            type: 'uint16',
          },
          {
            internalType: 'uint32[]',
            name: 'maxCallbackGasLimits',
            type: 'uint32[]',
          },
        ],
        internalType: 'struct OracleRouter.Config',
        name: 'config',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'CannotRemoveWithPendingRequests',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'DuplicateRequestId',
    type: 'error',
  },
  {
    inputs: [],
    name: 'EmptyRequestData',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidCalldata',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidConsumer',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSubscription',
    type: 'error',
  },
  {
    inputs: [],
    name: 'MustBeSubscriptionOwner',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyCallableFromCoordinator',
    type: 'error',
  },
  {
    inputs: [],
    name: 'TimeoutNotExceeded',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'uint16',
        name: 'maximumConsumers',
        type: 'uint16',
      },
    ],
    name: 'TooManyConsumers',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'maxConsumersPerSubscription',
            type: 'uint16',
          },
          {
            internalType: 'bytes4',
            name: 'handleOracleFulfillmentSelector',
            type: 'bytes4',
          },
          {
            internalType: 'uint16',
            name: 'gasForCallExactCheck',
            type: 'uint16',
          },
          {
            internalType: 'uint32[]',
            name: 'maxCallbackGasLimits',
            type: 'uint32[]',
          },
        ],
        indexed: false,
        internalType: 'struct OracleRouter.Config',
        name: '',
        type: 'tuple',
      },
    ],
    name: 'ConfigUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Paused',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'coordinator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum OracleResponse.FulfillResult',
        name: 'resultCode',
        type: 'uint8',
      },
    ],
    name: 'RequestNotProcessed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'enum OracleResponse.FulfillResult',
        name: 'resultCode',
        type: 'uint8',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'response',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'err',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'callbackReturnData',
        type: 'bytes',
      },
    ],
    name: 'RequestProcessed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'subscriptionOwner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'requestingContract',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'requestInitiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'callbackGasLimit',
        type: 'uint32',
      },
    ],
    name: 'RequestStart',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'RequestTimedOut',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'SubscriptionCanceled',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
    ],
    name: 'SubscriptionConsumerAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
    ],
    name: 'SubscriptionConsumerRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
    ],
    name: 'SubscriptionCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'SubscriptionOwnerTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'account',
        type: 'address',
      },
    ],
    name: 'Unpaused',
    type: 'event',
  },
  {
    inputs: [],
    name: 'MAX_CALLBACK_RETURN_BYTES',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
    ],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'coordinator',
    outputs: [
      {
        internalType: 'contract IOracleCoordinator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'createSubscription',
    outputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
    ],
    name: 'createSubscriptionWithConsumer',
    outputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes',
        name: 'response',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'err',
        type: 'bytes',
      },
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'requestId',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'coordinator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'client',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'subscriptionId',
            type: 'uint64',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'timeoutTimestamp',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleResponse.Commitment',
        name: 'commitment',
        type: 'tuple',
      },
    ],
    name: 'fulfill',
    outputs: [
      {
        internalType: 'enum OracleResponse.FulfillResult',
        name: 'resultCode',
        type: 'uint8',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getConfig',
    outputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'maxConsumersPerSubscription',
            type: 'uint16',
          },
          {
            internalType: 'bytes4',
            name: 'handleOracleFulfillmentSelector',
            type: 'bytes4',
          },
          {
            internalType: 'uint16',
            name: 'gasForCallExactCheck',
            type: 'uint16',
          },
          {
            internalType: 'uint32[]',
            name: 'maxCallbackGasLimits',
            type: 'uint32[]',
          },
        ],
        internalType: 'struct OracleRouter.Config',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'client',
        type: 'address',
      },
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'getConsumer',
    outputs: [
      {
        components: [
          {
            internalType: 'bool',
            name: 'allowed',
            type: 'bool',
          },
          {
            internalType: 'uint64',
            name: 'initiatedRequests',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'completedRequests',
            type: 'uint64',
          },
        ],
        internalType: 'struct IOracleSubscriptions.Consumer',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getCoordinator',
    outputs: [
      {
        internalType: 'contract IOracleCoordinator',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'getSubscription',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'consumers',
            type: 'address[]',
          },
        ],
        internalType: 'struct IOracleSubscriptions.Subscription',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getSubscriptionCount',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionIdStart',
        type: 'uint64',
      },
      {
        internalType: 'uint64',
        name: 'subscriptionIdEnd',
        type: 'uint64',
      },
    ],
    name: 'getSubscriptionsInRange',
    outputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address',
          },
          {
            internalType: 'address[]',
            name: 'consumers',
            type: 'address[]',
          },
        ],
        internalType: 'struct IOracleSubscriptions.Subscription[]',
        name: 'subscriptions',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'ownerCancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
    ],
    name: 'pendingRequestExists',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'consumer',
        type: 'address',
      },
    ],
    name: 'removeConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 's_currentSubscriptionId',
    outputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        internalType: 'uint32',
        name: 'callbackGasLimit',
        type: 'uint32',
      },
    ],
    name: 'sendRequest',
    outputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_coordinator',
        type: 'address',
      },
    ],
    name: 'setCoordinator',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'requestId',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'coordinator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'client',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'subscriptionId',
            type: 'uint64',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'timeoutTimestamp',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleResponse.Commitment[]',
        name: 'requestsToTimeoutByCommitment',
        type: 'tuple[]',
      },
    ],
    name: 'timeoutRequests',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address',
      },
    ],
    name: 'transferSubscriptionOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'typeAndVersion',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint16',
            name: 'maxConsumersPerSubscription',
            type: 'uint16',
          },
          {
            internalType: 'bytes4',
            name: 'handleOracleFulfillmentSelector',
            type: 'bytes4',
          },
          {
            internalType: 'uint16',
            name: 'gasForCallExactCheck',
            type: 'uint16',
          },
          {
            internalType: 'uint32[]',
            name: 'maxCallbackGasLimits',
            type: 'uint32[]',
          },
        ],
        internalType: 'struct OracleRouter.Config',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'updateConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

export const coordinatorAbi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: '_initialOwner',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'router',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint32',
            name: 'requestTimeoutSeconds',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleCoordinator.OracleConfig',
        name: '_config',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'EmptyPublicKey',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InconsistentReportData',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
    ],
    name: 'InvalidConfig',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'NonExistentOracle',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyCallableByRouter',
    type: 'error',
  },
  {
    inputs: [],
    name: 'OnlyCallableByRouterOwner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'OracleAlreadyExists',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'string',
        name: 'message',
        type: 'string',
      },
    ],
    name: 'ReportInvalid',
    type: 'error',
  },
  {
    inputs: [],
    name: 'RouterMustBeSet',
    type: 'error',
  },
  {
    inputs: [],
    name: 'UnauthorizedPublicKeyChange',
    type: 'error',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'CommitmentDeleted',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxOracles',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint32',
        name: 'previousConfigBlockNumber',
        type: 'uint32',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'configDigest',
        type: 'bytes32',
      },
    ],
    name: 'ConfigSet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'requestTimeoutSeconds',
            type: 'uint32',
          },
        ],
        indexed: false,
        internalType: 'struct OracleCoordinator.OracleConfig',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'ConfigUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'OracleAdded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'OracleRemoved',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferRequested',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'OwnershipTransferred',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'requestingContract',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'requestInitiator',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'subscriptionId',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'subscriptionOwner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: 'data',
        type: 'bytes',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'callbackGasLimit',
        type: 'uint64',
      },
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'requestId',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'coordinator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'client',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'subscriptionId',
            type: 'uint64',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'timeoutTimestamp',
            type: 'uint32',
          },
        ],
        indexed: false,
        internalType: 'struct OracleResponse.Commitment',
        name: 'commitment',
        type: 'tuple',
      },
    ],
    name: 'RequestSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'ResponseReceived',
    type: 'event',
  },
  {
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'addOracleNode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'requestId',
        type: 'bytes32',
      },
    ],
    name: 'deleteCommitment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getConfig',
    outputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'requestTimeoutSeconds',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleCoordinator.OracleConfig',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'isOracleNode',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'latestConfigDetails',
    outputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'maxOracles',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'previousConfigBlockNumber',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'configDigest',
            type: 'bytes32',
          },
        ],
        internalType: 'struct OCRAbstract.OCRConfig',
        name: 'config',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'transmitter',
        type: 'address',
      },
    ],
    name: 'removeOracleNode',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint256',
            name: 'maxOracles',
            type: 'uint256',
          },
          {
            internalType: 'uint32',
            name: 'previousConfigBlockNumber',
            type: 'uint32',
          },
          {
            internalType: 'bytes32',
            name: 'configDigest',
            type: 'bytes32',
          },
        ],
        internalType: 'struct OCRAbstract.OCRConfig',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes',
          },
          {
            internalType: 'address',
            name: 'requestingContract',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'subscriptionId',
            type: 'uint64',
          },
          {
            internalType: 'uint64',
            name: 'initiatedRequests',
            type: 'uint64',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint64',
            name: 'completedRequests',
            type: 'uint64',
          },
          {
            internalType: 'address',
            name: 'subscriptionOwner',
            type: 'address',
          },
        ],
        internalType: 'struct OracleResponse.RequestMeta',
        name: 'request',
        type: 'tuple',
      },
    ],
    name: 'startRequest',
    outputs: [
      {
        components: [
          {
            internalType: 'bytes32',
            name: 'requestId',
            type: 'bytes32',
          },
          {
            internalType: 'address',
            name: 'coordinator',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'client',
            type: 'address',
          },
          {
            internalType: 'uint64',
            name: 'subscriptionId',
            type: 'uint64',
          },
          {
            internalType: 'uint32',
            name: 'callbackGasLimit',
            type: 'uint32',
          },
          {
            internalType: 'uint32',
            name: 'timeoutTimestamp',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleResponse.Commitment',
        name: 'commitment',
        type: 'tuple',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'signers',
        type: 'address[]',
      },
      {
        internalType: 'bytes',
        name: 'report',
        type: 'bytes',
      },
      {
        internalType: 'bytes32',
        name: 'reportHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32[]',
        name: 'rs',
        type: 'bytes32[]',
      },
      {
        internalType: 'bytes32[]',
        name: 'ss',
        type: 'bytes32[]',
      },
      {
        internalType: 'uint8[]',
        name: 'vs',
        type: 'uint8[]',
      },
    ],
    name: 'transmit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'typeAndVersion',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'uint32',
            name: 'requestTimeoutSeconds',
            type: 'uint32',
          },
        ],
        internalType: 'struct OracleCoordinator.OracleConfig',
        name: 'config',
        type: 'tuple',
      },
    ],
    name: 'updateConfig',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
