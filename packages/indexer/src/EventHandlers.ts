import {
	OracleCoordinator,
	OracleCoordinator_OracleAdded,
	OracleCoordinator_OracleRemoved,
	OracleCoordinator_RequestSent,
	OracleCoordinator_ResponseReceived,
	OracleRouter,
	OracleRouter_RequestNotProcessed,
	OracleRouter_RequestProcessed,
	OracleRouter_RequestStart,
	OracleRouter_RequestTimedOut,
	OracleRouter_SubscriptionCanceled,
	OracleRouter_SubscriptionConsumerAdded,
	OracleRouter_SubscriptionConsumerRemoved,
	OracleRouter_SubscriptionCreated,
	OracleRouter_SubscriptionOwnerTransferred,
} from 'generated';

OracleCoordinator.OracleAdded.handler(async ({ event, context }) => {
	const entity: OracleCoordinator_OracleAdded = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		transmitter: event.params.transmitter,
	};

	context.OracleCoordinator_OracleAdded.set(entity);
});

OracleCoordinator.OracleRemoved.handler(async ({ event, context }) => {
	const entity: OracleCoordinator_OracleRemoved = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		transmitter: event.params.transmitter,
	};

	context.OracleCoordinator_OracleRemoved.set(entity);
});

OracleCoordinator.RequestSent.handler(async ({ event, context }) => {
	const entity: OracleCoordinator_RequestSent = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
		requestingContract: event.params.requestingContract,
		requestInitiator: event.params.requestInitiator,
		subscriptionId: event.params.subscriptionId,
		subscriptionOwner: event.params.subscriptionOwner,
		data: event.params.data,
		callbackGasLimit: event.params.callbackGasLimit,
		commitment_0: event.params.commitment[0],
		commitment_1: event.params.commitment[1],
		commitment_2: event.params.commitment[2],
		commitment_3: event.params.commitment[3],
		commitment_4: event.params.commitment[4],
		commitment_5: event.params.commitment[5],
	};

	context.OracleCoordinator_RequestSent.set(entity);
});

OracleCoordinator.ResponseReceived.handler(async ({ event, context }) => {
	const entity: OracleCoordinator_ResponseReceived = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
		transmitter: event.params.transmitter,
	};

	context.OracleCoordinator_ResponseReceived.set(entity);
});

OracleRouter.RequestNotProcessed.handler(async ({ event, context }) => {
	const entity: OracleRouter_RequestNotProcessed = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
		coordinator: event.params.coordinator,
		transmitter: event.params.transmitter,
		resultCode: event.params.resultCode,
	};

	context.OracleRouter_RequestNotProcessed.set(entity);
});

OracleRouter.RequestProcessed.handler(async ({ event, context }) => {
	const entity: OracleRouter_RequestProcessed = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
		subscriptionId: event.params.subscriptionId,
		transmitter: event.params.transmitter,
		resultCode: event.params.resultCode,
		response: event.params.response,
		err: event.params.err,
		callbackReturnData: event.params.callbackReturnData,
	};

	context.OracleRouter_RequestProcessed.set(entity);
});

OracleRouter.RequestStart.handler(async ({ event, context }) => {
	const entity: OracleRouter_RequestStart = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
		subscriptionId: event.params.subscriptionId,
		subscriptionOwner: event.params.subscriptionOwner,
		requestingContract: event.params.requestingContract,
		requestInitiator: event.params.requestInitiator,
		data: event.params.data,
		callbackGasLimit: event.params.callbackGasLimit,
	};

	context.OracleRouter_RequestStart.set(entity);
});

OracleRouter.RequestTimedOut.handler(async ({ event, context }) => {
	const entity: OracleRouter_RequestTimedOut = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		requestId: event.params.requestId,
	};

	context.OracleRouter_RequestTimedOut.set(entity);
});

OracleRouter.SubscriptionCanceled.handler(async ({ event, context }) => {
	const entity: OracleRouter_SubscriptionCanceled = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		subscriptionId: event.params.subscriptionId,
	};

	context.OracleRouter_SubscriptionCanceled.set(entity);
});

OracleRouter.SubscriptionConsumerAdded.handler(async ({ event, context }) => {
	const entity: OracleRouter_SubscriptionConsumerAdded = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		subscriptionId: event.params.subscriptionId,
		consumer: event.params.consumer,
	};

	context.OracleRouter_SubscriptionConsumerAdded.set(entity);
});

OracleRouter.SubscriptionConsumerRemoved.handler(async ({ event, context }) => {
	const entity: OracleRouter_SubscriptionConsumerRemoved = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		subscriptionId: event.params.subscriptionId,
		consumer: event.params.consumer,
	};

	context.OracleRouter_SubscriptionConsumerRemoved.set(entity);
});

OracleRouter.SubscriptionCreated.handler(async ({ event, context }) => {
	const entity: OracleRouter_SubscriptionCreated = {
		id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
		subscriptionId: event.params.subscriptionId,
		owner: event.params.owner,
	};

	context.OracleRouter_SubscriptionCreated.set(entity);
});

OracleRouter.SubscriptionOwnerTransferred.handler(
	async ({ event, context }) => {
		const entity: OracleRouter_SubscriptionOwnerTransferred = {
			id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
			subscriptionId: event.params.subscriptionId,
			from: event.params.from,
			to: event.params.to,
		};

		context.OracleRouter_SubscriptionOwnerTransferred.set(entity);
	}
);
