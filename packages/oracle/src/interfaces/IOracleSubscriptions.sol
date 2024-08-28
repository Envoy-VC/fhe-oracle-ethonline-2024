// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleResponse} from "../libraries/OracleResponse.sol";

/// @title FHE Oracle Subscription interface.
interface IOracleSubscriptions {
    struct Subscription {
        // The owner can fund/withdraw/cancel the subscription.
        address owner;
        // Client contracts that can use the subscription
        address[] consumers;
    }

    struct Consumer {
        // Owner can Cancel the sub
        bool allowed;
        // The number of requests that have been started
        uint64 initiatedRequests;
        // The number of requests that have successfully completed or timed out
        uint64 completedRequests;
    }

    /// @notice Get details about a subscription.
    /// @param subscriptionId - the ID of the subscription
    /// @return subscription - see IOracleSubscriptions.Subscription for more information on the structure
    function getSubscription(uint64 subscriptionId) external view returns (Subscription memory);

    /// @notice Retrieve details about multiple subscriptions using an inclusive range
    /// @param subscriptionIdStart - the ID of the subscription to start the range at
    /// @param subscriptionIdEnd - the ID of the subscription to end the range at
    /// @return subscriptions - see IOracleSubscriptions.Subscription for more information on the structure
    function getSubscriptionsInRange(uint64 subscriptionIdStart, uint64 subscriptionIdEnd)
        external
        view
        returns (Subscription[] memory);

    /// @notice Get details about a consumer of a subscription.
    /// @param client - the consumer contract address
    /// @param subscriptionId - the ID of the subscription
    /// @return consumer - see IOracleSubscriptions.Consumer for more information on the structure
    function getConsumer(address client, uint64 subscriptionId) external view returns (Consumer memory);

    /// @notice Get details about the total number of subscription accounts
    /// @return count - total number of subscriptions in the system
    function getSubscriptionCount() external view returns (uint64);

    /// @notice Time out all expired requests: removes the ability for the request to be fulfilled
    /// @param requestsToTimeoutByCommitment - A list of request commitments to time out
    /// @dev The commitment can be found on the "OracleRequest" event created when sending the request.
    function timeoutRequests(OracleResponse.Commitment[] calldata requestsToTimeoutByCommitment) external;

    /// @notice Owner cancel subscription.
    /// @dev Only callable by the Router Owner
    /// @param subscriptionId subscription id
    /// @dev notably can be called even if there are pending requests, outstanding ones may fail onchain
    function ownerCancelSubscription(uint64 subscriptionId) external;

    /// @notice Transfer ownership of a subscription to a new address.
    /// @param subscriptionId - ID of the subscription
    /// @param newOwner - Address of the new owner
    /// @dev Only callable by the Subscription's owner
    function transferSubscriptionOwnership(uint64 subscriptionId, address newOwner) external;

    /// @notice Create a new subscription.
    /// @return subscriptionId - A unique subscription id.
    /// @dev You can manage the consumer set dynamically with addConsumer/removeConsumer.
    function createSubscription() external returns (uint64);

    /// @notice Create a new subscription and add a consumer.
    /// @return subscriptionId - A unique subscription id.
    /// @dev You can manage the consumer set dynamically with addConsumer/removeConsumer.
    function createSubscriptionWithConsumer(address consumer) external returns (uint64 subscriptionId);

    /// @notice Remove a consumer from a FHE Oracle subscription.
    /// @dev Only callable by the Subscription's owner
    /// @param subscriptionId - ID of the subscription
    /// @param consumer - Consumer to remove from the subscription
    function removeConsumer(uint64 subscriptionId, address consumer) external;

    /// @notice Add a consumer to a FHE Oracle  subscription.
    /// @dev Only callable by the Subscription's owner
    /// @param subscriptionId - ID of the subscription
    /// @param consumer - New consumer which can use the subscription
    function addConsumer(uint64 subscriptionId, address consumer) external;

    /// @notice Cancel a subscription
    /// @dev Only callable by the Subscription's owner
    /// @param subscriptionId - ID of the subscription
    function cancelSubscription(uint64 subscriptionId) external;

    /// @notice Check to see if there exists a request commitment for all consumers for a given subscription.
    /// @param subscriptionId - ID of the subscription
    /// @return true if there exists at least one unfulfilled request for the subscription, false otherwise.
    /// @dev Used to disable subscription canceling while outstanding request are present.
    function pendingRequestExists(uint64 subscriptionId) external view returns (bool);
}
