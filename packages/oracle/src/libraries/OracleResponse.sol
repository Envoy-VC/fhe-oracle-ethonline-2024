// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Library of types that are used for fulfillment of a Oracle request
library FunctionsResponse {
    // Used to send request information from the Router to the Coordinator
    struct RequestMeta {
        // CBOR encoded FHE Oracle request data, use OracleRequest library to encode a request.
        bytes data;
        // The client contract that is sending the request
        address requestingContract;
        // Identifier of the subscription
        uint64 subscriptionId;
        // The number of requests that have been started
        uint64 initiatedRequests;
        // The amount of gas that the callback to the consuming contract will be given
        uint32 callbackGasLimit;
        // The number of requests that have successfully completed or timed out
        uint64 completedRequests;
        // The owner of the subscription
        address subscriptionOwner;
    }

    enum FulfillResult {
        FULFILLED, // 0
        USER_CALLBACK_ERROR, // 1
        INVALID_REQUEST_ID, // 2
        INSUFFICIENT_GAS_PROVIDED, // 3
        INVALID_COMMITMENT // 4

    }

    // Used to track request progress in the pipeline.
    struct Commitment {
        // A unique identifier for a FHE Oracle request
        bytes32 requestId;
        // The Coordinator contract that manages the request
        address coordinator;
        // The client contract that sent the request
        address client;
        // Identifier of the subscription
        uint64 subscriptionId;
        // The amount of gas that the callback to the consuming contract will be given
        uint32 callbackGasLimit;
        //  The timestamp at which a request will be eligible to be timed out
        uint32 timeoutTimestamp;
    }
}
