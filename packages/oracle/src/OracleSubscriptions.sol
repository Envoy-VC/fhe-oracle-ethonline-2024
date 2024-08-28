// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleSubscriptions} from "./interfaces/IOracleSubscriptions.sol";
import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";

import {OracleResponse} from "./libraries/OracleResponse.sol";

/// @title Oracle Subscriptions contract
abstract contract OracleSubscriptions is IOracleSubscriptions {
    using OracleResponse for OracleResponse.Commitment;

    // ================================================================
    // |                       Request state                          |
    // ================================================================
    mapping(bytes32 requestId => bytes32 commitmentHash) internal s_requestCommitments;

    // ================================================================
    // |                      Subscription state                      |
    // ================================================================
    // Keep a count of the number of subscriptions so that its possible to
    // loop through all the current subscriptions via .getSubscription().
    uint64 private s_currentSubscriptionId;

    mapping(uint64 subscriptionId => Subscription) private s_subscriptions;

    // Maintains the list of keys in s_consumers.
    mapping(address consumer => mapping(uint64 subscriptionId => Consumer)) private s_consumers;

    event SubscriptionCreated(uint64 indexed subscriptionId, address owner);
    event SubscriptionConsumerAdded(uint64 indexed subscriptionId, address consumer);
    event SubscriptionConsumerRemoved(uint64 indexed subscriptionId, address consumer);
    event SubscriptionCanceled(uint64 indexed subscriptionId, address fundsRecipient);
    event SubscriptionOwnerTransferred(uint64 indexed subscriptionId, address from, address to);

    event RequestTimedOut(bytes32 indexed requestId);

    error TooManyConsumers(uint16 maximumConsumers);
    error InvalidConsumer();
    error CannotRemoveWithPendingRequests();
    error InvalidSubscription();
    error InvalidCalldata();
    error MustBeSubscriptionOwner();
    error TimeoutNotExceeded();

    // ================================================================
    // |                       Initialization                         |
    // ================================================================
    constructor() {}

    // ================================================================
    // |                      Request/Response                        |
    // ================================================================

    /// @notice Sets a request as in-flight and increments the initiatedRequests counter.
    /// @dev Only callable within the Router
    function _markRequestInFlight(address client, uint64 subscriptionId) internal {
        s_consumers[client][subscriptionId].initiatedRequests += 1;
    }

    // ================================================================
    // |                      Owner methods                           |
    // ================================================================

    // /// @inheritdoc IOracleSubscriptions
    // function ownerCancelSubscription(uint64 subscriptionId) external override {
    //     _onlyRouterOwner();
    //     _isExistingSubscription(subscriptionId);
    //     _cancelSubscriptionHelper(subscriptionId, s_subscriptions[subscriptionId].owner, false);
    // }

    // ================================================================
    // |                   Subscription management                   |
    // ================================================================

    /// @inheritdoc IOracleSubscriptions
    function getSubscriptionCount() external view override returns (uint64) {
        return s_currentSubscriptionId;
    }

    /// @inheritdoc IOracleSubscriptions
    function getSubscription(uint64 subscriptionId) public view override returns (Subscription memory) {
        _isExistingSubscription(subscriptionId);
        return s_subscriptions[subscriptionId];
    }

    /// @inheritdoc IOracleSubscriptions
    function getSubscriptionsInRange(uint64 subscriptionIdStart, uint64 subscriptionIdEnd)
        external
        view
        override
        returns (Subscription[] memory subscriptions)
    {
        if (
            subscriptionIdStart > subscriptionIdEnd || subscriptionIdEnd > s_currentSubscriptionId
                || s_currentSubscriptionId == 0
        ) {
            revert InvalidCalldata();
        }

        subscriptions = new Subscription[]((subscriptionIdEnd - subscriptionIdStart) + 1);
        for (uint256 i = 0; i <= subscriptionIdEnd - subscriptionIdStart; ++i) {
            subscriptions[i] = s_subscriptions[uint64(subscriptionIdStart + i)];
        }

        return subscriptions;
    }

    /// @inheritdoc IOracleSubscriptions
    function getConsumer(address client, uint64 subscriptionId) public view override returns (Consumer memory) {
        return s_consumers[client][subscriptionId];
    }

    /// @dev Used within this file & OracleRouter.sol
    function _isExistingSubscription(uint64 subscriptionId) internal view {
        if (s_subscriptions[subscriptionId].owner == address(0)) {
            revert InvalidSubscription();
        }
    }

    /// @dev Used within OracleRouter.sol
    function _isAllowedConsumer(address client, uint64 subscriptionId) internal view {
        if (!s_consumers[client][subscriptionId].allowed) {
            revert InvalidConsumer();
        }
    }

    /// @inheritdoc IOracleSubscriptions
    function createSubscription() external override returns (uint64 subscriptionId) {
        _whenNotPaused();

        subscriptionId = ++s_currentSubscriptionId;
        s_subscriptions[subscriptionId] = Subscription({owner: msg.sender, consumers: new address[](0)});

        emit SubscriptionCreated(subscriptionId, msg.sender);

        return subscriptionId;
    }

    /// @inheritdoc IOracleSubscriptions
    function createSubscriptionWithConsumer(address consumer) external override returns (uint64 subscriptionId) {
        _whenNotPaused();

        subscriptionId = ++s_currentSubscriptionId;
        s_subscriptions[subscriptionId] = Subscription({owner: msg.sender, consumers: new address[](0)});

        s_subscriptions[subscriptionId].consumers.push(consumer);
        s_consumers[consumer][subscriptionId].allowed = true;

        emit SubscriptionCreated(subscriptionId, msg.sender);
        emit SubscriptionConsumerAdded(subscriptionId, consumer);

        return subscriptionId;
    }

    /// @inheritdoc IOracleSubscriptions
    function transferSubscriptionOwnership(uint64 subscriptionId, address newOwner) external override {
        _whenNotPaused();
        _onlySubscriptionOwner(subscriptionId);

        if (newOwner == address(0) || s_subscriptions[subscriptionId].owner == newOwner) {
            revert InvalidCalldata();
        }

        s_subscriptions[subscriptionId].owner = newOwner;
        emit SubscriptionOwnerTransferred(subscriptionId, msg.sender, newOwner);
    }

    /// @inheritdoc IOracleSubscriptions
    function removeConsumer(uint64 subscriptionId, address consumer) external override {
        _whenNotPaused();
        _onlySubscriptionOwner(subscriptionId);

        Consumer memory consumerData = s_consumers[consumer][subscriptionId];
        _isAllowedConsumer(consumer, subscriptionId);
        if (consumerData.initiatedRequests != consumerData.completedRequests) {
            revert CannotRemoveWithPendingRequests();
        }
        // Note bounded by config.maxConsumers
        address[] memory consumers = s_subscriptions[subscriptionId].consumers;
        for (uint256 i = 0; i < consumers.length; ++i) {
            if (consumers[i] == consumer) {
                // Storage write to preserve last element
                s_subscriptions[subscriptionId].consumers[i] = consumers[consumers.length - 1];
                // Storage remove last element
                s_subscriptions[subscriptionId].consumers.pop();
                break;
            }
        }
        delete s_consumers[consumer][subscriptionId];
        emit SubscriptionConsumerRemoved(subscriptionId, consumer);
    }

    /// @dev Overriden in OracleRouter.sol
    function _getMaxConsumers() internal view virtual returns (uint16);

    /// @inheritdoc IOracleSubscriptions
    function addConsumer(uint64 subscriptionId, address consumer) external override {
        _whenNotPaused();
        _onlySubscriptionOwner(subscriptionId);

        // Already maxed, cannot add any more consumers.
        uint16 maximumConsumers = _getMaxConsumers();
        if (s_subscriptions[subscriptionId].consumers.length >= maximumConsumers) {
            revert TooManyConsumers(maximumConsumers);
        }
        if (s_consumers[consumer][subscriptionId].allowed) {
            // Idempotence - do nothing if already added.
            // Ensures uniqueness in s_subscriptions[subscriptionId].consumers.
            return;
        }

        s_consumers[consumer][subscriptionId].allowed = true;
        s_subscriptions[subscriptionId].consumers.push(consumer);

        emit SubscriptionConsumerAdded(subscriptionId, consumer);
    }

    function _cancelSubscriptionHelper(uint64 subscriptionId, address toAddress) private {
        Subscription memory subscription = s_subscriptions[subscriptionId];
        uint64 completedRequests = 0;

        // NOTE: loop iterations are bounded by config.maxConsumers
        // If no consumers, does nothing.
        for (uint256 i = 0; i < subscription.consumers.length; ++i) {
            address consumer = subscription.consumers[i];
            completedRequests += s_consumers[consumer][subscriptionId].completedRequests;
            delete s_consumers[consumer][subscriptionId];
        }
        delete s_subscriptions[subscriptionId];

        emit SubscriptionCanceled(subscriptionId, toAddress);
    }

    /// @inheritdoc IOracleSubscriptions
    function cancelSubscription(uint64 subscriptionId, address to) external override {
        _whenNotPaused();
        _onlySubscriptionOwner(subscriptionId);

        if (pendingRequestExists(subscriptionId)) {
            revert CannotRemoveWithPendingRequests();
        }

        _cancelSubscriptionHelper(subscriptionId, to);
    }

    /// @inheritdoc IOracleSubscriptions
    function pendingRequestExists(uint64 subscriptionId) public view override returns (bool) {
        address[] memory consumers = s_subscriptions[subscriptionId].consumers;
        // NOTE: loop iterations are bounded by config.maxConsumers
        for (uint256 i = 0; i < consumers.length; ++i) {
            Consumer memory consumer = s_consumers[consumers[i]][subscriptionId];
            if (consumer.initiatedRequests != consumer.completedRequests) {
                return true;
            }
        }
        return false;
    }

    // ================================================================
    // |                        Request Timeout                       |
    // ================================================================

    /// @inheritdoc IOracleSubscriptions
    function timeoutRequests(OracleResponse.Commitment[] calldata requestsToTimeoutByCommitment) external override {
        _whenNotPaused();

        for (uint256 i = 0; i < requestsToTimeoutByCommitment.length; ++i) {
            OracleResponse.Commitment memory request = requestsToTimeoutByCommitment[i];
            bytes32 requestId = request.requestId;
            uint64 subscriptionId = request.subscriptionId;

            // Check that request ID is valid
            if (keccak256(abi.encode(request)) != s_requestCommitments[requestId]) {
                revert InvalidCalldata();
            }

            // Check that request has exceeded allowed request time
            if (block.timestamp < request.timeoutTimestamp) {
                revert TimeoutNotExceeded();
            }

            // Notify the Coordinator that the request should no longer be fulfilled
            IOracleCoordinator(request.coordinator).deleteCommitment(requestId);
            s_consumers[request.client][subscriptionId].completedRequests += 1;
            // Delete commitment within Router state
            delete s_requestCommitments[requestId];

            emit RequestTimedOut(requestId);
        }
    }

    // ================================================================
    // |                         Modifiers                            |
    // ================================================================

    function _onlySubscriptionOwner(uint64 subscriptionId) internal view {
        address owner = s_subscriptions[subscriptionId].owner;
        if (owner == address(0)) {
            revert InvalidSubscription();
        }
        if (msg.sender != owner) {
            revert MustBeSubscriptionOwner();
        }
    }

    /// @dev Overriden in FunctionsRouter.sol
    function _onlyRouterOwner() internal virtual;

    /// @dev Overriden in FunctionsRouter.sol
    function _whenNotPaused() internal virtual;
}
