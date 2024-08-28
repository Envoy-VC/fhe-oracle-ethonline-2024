// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ITypeAndVersion} from "./shared/interfaces/ITypeAndVersion.sol";
import {IOracleRouter} from "./interfaces/IOracleRouter.sol";
import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";

import {OracleSubscriptions} from "./OracleSubscriptions.sol";
import {OracleResponse} from "./libraries/OracleResponse.sol";
import {ConfirmedOwner} from "./shared/access/ConfirmedOwner.sol";

import {SafeCast} from "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {Pausable} from "./shared/utils/Pausable.sol";

contract OracleRouter is IOracleRouter, OracleSubscriptions, Pausable, ITypeAndVersion, ConfirmedOwner {
    using OracleResponse for OracleResponse.RequestMeta;
    using OracleResponse for OracleResponse.Commitment;
    using OracleResponse for OracleResponse.FulfillResult;

    string public constant override typeAndVersion = "Oracle Router v2.0.0";

    // We limit return data to a selector plus 4 words. This is to avoid
    // malicious contracts from returning large amounts of data and causing
    // repeated out-of-gas scenarios.
    uint16 public constant MAX_CALLBACK_RETURN_BYTES = 4 + 4 * 32;
    uint8 private constant MAX_CALLBACK_GAS_LIMIT_FLAGS_INDEX = 0;

    IOracleCoordinator public coordinator;

    event RequestStart(
        bytes32 indexed requestId,
        uint64 indexed subscriptionId,
        address subscriptionOwner,
        address requestingContract,
        address requestInitiator,
        bytes data,
        uint32 callbackGasLimit
    );

    event RequestProcessed(
        bytes32 indexed requestId,
        uint64 indexed subscriptionId,
        address transmitter,
        OracleResponse.FulfillResult resultCode,
        bytes response,
        bytes err,
        bytes callbackReturnData
    );

    event RequestNotProcessed(
        bytes32 indexed requestId, address coordinator, address transmitter, OracleResponse.FulfillResult resultCode
    );

    error EmptyRequestData();
    error OnlyCallableFromCoordinator();
    error DuplicateRequestId(bytes32 requestId);

    struct CallbackResult {
        // Whether the callback succeeded or not
        bool success;
        // The amount of gas consumed during the callback
        uint256 gasUsed;
        // The return of the callback function
        bytes returnData;
    }

    // ================================================================
    // |                    Configuration state                       |
    // ================================================================
    // solhint-disable-next-line gas-struct-packing
    struct Config {
        // Maximum number of consumers which can be added to a single subscription. This bound ensures we are able to loop over all subscription consumers as needed, without exceeding gas limits. Should a user require more consumers, they can use multiple subscriptions.
        uint16 maxConsumersPerSubscription;
        // The function selector that is used when calling back to the Client contract
        bytes4 handleOracleFulfillmentSelector;
        // Used during calling back to the client. Ensures we have at least enough gas to be able to revert if gasAmount >  63//64*gas available.
        uint16 gasForCallExactCheck;
        // List of max callback gas limits used by flag with MAX_CALLBACK_GAS_LIMIT_FLAGS_INDEX
        uint32[] maxCallbackGasLimits;
    }

    Config private s_config;

    event ConfigUpdated(Config);

    // ================================================================
    // |                       Initialization                         |
    // ================================================================

    constructor(address _coordinator, Config memory config)
        Pausable()
        OracleSubscriptions()
        ConfirmedOwner(msg.sender)
    {
        // Set the intial configuration
        updateConfig(config);
        coordinator = IOracleCoordinator(_coordinator);
    }

    // ================================================================
    // |                        Configuration                         |
    // ================================================================

    /// @notice The identifier of the route to retrieve the address of the access control contract
    // The access control contract controls which accounts can manage subscriptions
    /// @return id - bytes32 id that can be passed to the "getContractById" of the Router
    function getConfig() external view returns (Config memory) {
        return s_config;
    }

    /// @notice The router configuration
    function updateConfig(Config memory config) public onlyOwner {
        s_config = config;
        emit ConfigUpdated(config);
    }

    /// @notice The address of the coordinator contract
    /// @return coordinator - the address of the coordinator contract
    function getCoordinator() external view returns (IOracleCoordinator) {
        return coordinator;
    }

    /// @notice Set the coordinator contract address
    /// @param _coordinator - the address of the coordinator contract
    /// @dev Only callable by the owner
    function setCoordinator(address _coordinator) external onlyOwner {
        coordinator = IOracleCoordinator(_coordinator);
    }

    function _getMaxConsumers() internal view override returns (uint16) {
        return s_config.maxConsumersPerSubscription;
    }

    // ================================================================
    // |                           Requests                           |
    // ================================================================

    /// @inheritdoc IOracleRouter
    function sendRequest(uint64 subscriptionId, bytes calldata data, uint32 callbackGasLimit)
        external
        returns (bytes32)
    {
        return _sendRequest(subscriptionId, data, callbackGasLimit);
    }

    function _sendRequest(uint64 subscriptionId, bytes memory data, uint32 callbackGasLimit)
        private
        returns (bytes32)
    {
        _whenNotPaused();
        _isExistingSubscription(subscriptionId);
        _isAllowedConsumer(msg.sender, subscriptionId);

        if (data.length == 0) {
            revert EmptyRequestData();
        }

        Subscription memory subscription = getSubscription(subscriptionId);
        Consumer memory consumer = getConsumer(msg.sender, subscriptionId);

        // Forward request to Coordinator
        OracleResponse.Commitment memory commitment = coordinator.startRequest(
            OracleResponse.RequestMeta({
                data: data,
                requestingContract: msg.sender,
                subscriptionId: subscriptionId,
                initiatedRequests: consumer.initiatedRequests,
                completedRequests: consumer.completedRequests,
                callbackGasLimit: callbackGasLimit,
                subscriptionOwner: subscription.owner
            })
        );

        // Do not allow setting a commitment for a requestId that already exists
        if (s_requestCommitments[commitment.requestId] != bytes32(0)) {
            revert DuplicateRequestId(commitment.requestId);
        }

        // Store a commitment about the request
        s_requestCommitments[commitment.requestId] = keccak256(
            abi.encode(
                OracleResponse.Commitment({
                    requestId: commitment.requestId,
                    coordinator: address(coordinator),
                    client: msg.sender,
                    subscriptionId: subscriptionId,
                    callbackGasLimit: callbackGasLimit,
                    timeoutTimestamp: commitment.timeoutTimestamp
                })
            )
        );

        _markRequestInFlight(msg.sender, subscriptionId);

        emit RequestStart({
            requestId: commitment.requestId,
            subscriptionId: subscriptionId,
            subscriptionOwner: subscription.owner,
            requestingContract: msg.sender,
            // solhint-disable-next-line avoid-tx-origin
            requestInitiator: tx.origin,
            data: data,
            callbackGasLimit: callbackGasLimit
        });

        return commitment.requestId;
    }

    // ================================================================
    // |                           Responses                          |
    // ================================================================

    /// @inheritdoc IOracleRouter
    function fulfill(
        bytes memory response,
        bytes memory err,
        address transmitter,
        OracleResponse.Commitment memory commitment
    ) external override returns (OracleResponse.FulfillResult resultCode) {
        _whenNotPaused();

        if (msg.sender != commitment.coordinator) {
            revert OnlyCallableFromCoordinator();
        }

        {
            bytes32 commitmentHash = s_requestCommitments[commitment.requestId];

            if (commitmentHash == bytes32(0)) {
                resultCode = OracleResponse.FulfillResult.INVALID_REQUEST_ID;
                emit RequestNotProcessed(commitment.requestId, commitment.coordinator, transmitter, resultCode);
                return (resultCode);
            }

            if (keccak256(abi.encode(commitment)) != commitmentHash) {
                resultCode = OracleResponse.FulfillResult.INVALID_COMMITMENT;
                emit RequestNotProcessed(commitment.requestId, commitment.coordinator, transmitter, resultCode);
                return (resultCode);
            }

            // Check that the transmitter has supplied enough gas for the callback to succeed
            if (gasleft() < commitment.callbackGasLimit) {
                resultCode = OracleResponse.FulfillResult.INSUFFICIENT_GAS_PROVIDED;
                emit RequestNotProcessed(commitment.requestId, commitment.coordinator, transmitter, resultCode);
                return (resultCode);
            }
        }

        delete s_requestCommitments[commitment.requestId];

        CallbackResult memory result =
            _callback(commitment.requestId, response, err, commitment.callbackGasLimit, commitment.client);

        resultCode =
            result.success ? OracleResponse.FulfillResult.FULFILLED : OracleResponse.FulfillResult.USER_CALLBACK_ERROR;

        emit RequestProcessed({
            requestId: commitment.requestId,
            subscriptionId: commitment.subscriptionId,
            transmitter: transmitter,
            resultCode: resultCode,
            response: response,
            err: err,
            callbackReturnData: result.returnData
        });

        return (resultCode);
    }

    function _callback(
        bytes32 requestId,
        bytes memory response,
        bytes memory err,
        uint32 callbackGasLimit,
        address client
    ) private returns (CallbackResult memory) {
        bool destinationNoLongerExists;
        assembly {
            // solidity calls check that a contract actually exists at the destination, so we do the same
            destinationNoLongerExists := iszero(extcodesize(client))
        }
        if (destinationNoLongerExists) {
            // Return without attempting callback
            // The subscription will still be charged to reimburse transmitter's gas overhead
            return CallbackResult({success: false, gasUsed: 0, returnData: new bytes(0)});
        }

        bytes memory encodedCallback =
            abi.encodeWithSelector(s_config.handleOracleFulfillmentSelector, requestId, response, err);

        uint16 gasForCallExactCheck = s_config.gasForCallExactCheck;

        // Call with explicitly the amount of callback gas requested
        // NOTE: that callWithExactGas will revert if we do not have sufficient gas
        // to give the callee.

        bool success;
        uint256 gasUsed;
        // allocate return data memory ahead of time
        bytes memory returnData = new bytes(MAX_CALLBACK_RETURN_BYTES);

        assembly {
            let g := gas()
            // Compute g -= gasForCallExactCheck and check for underflow
            // The gas actually passed to the callee is _min(gasAmount, 63//64*gas available).
            // We want to ensure that we revert if gasAmount >  63//64*gas available
            // as we do not want to provide them with less, however that check itself costs
            // gas. gasForCallExactCheck ensures we have at least enough gas to be able
            // to revert if gasAmount >  63//64*gas available.
            if lt(g, gasForCallExactCheck) { revert(0, 0) }
            g := sub(g, gasForCallExactCheck)
            // if g - g//64 <= gasAmount, revert
            // (we subtract g//64 because of EIP-150)
            if iszero(gt(sub(g, div(g, 64)), callbackGasLimit)) { revert(0, 0) }
            // call and report whether we succeeded
            // call(gas,addr,value,argsOffset,argsLength,retOffset,retLength)
            let gasBeforeCall := gas()
            success := call(callbackGasLimit, client, 0, add(encodedCallback, 0x20), mload(encodedCallback), 0, 0)
            gasUsed := sub(gasBeforeCall, gas())

            // limit our copy to MAX_CALLBACK_RETURN_BYTES bytes
            let toCopy := returndatasize()
            if gt(toCopy, MAX_CALLBACK_RETURN_BYTES) { toCopy := MAX_CALLBACK_RETURN_BYTES }
            // Store the length of the copied bytes
            mstore(returnData, toCopy)
            // copy the bytes from returnData[0:_toCopy]
            returndatacopy(add(returnData, 0x20), 0, toCopy)
        }

        return CallbackResult({success: success, gasUsed: gasUsed, returnData: returnData});
    }

    // ================================================================
    // |                           Modifiers                          |
    // ================================================================
    // Favoring internal functions over actual modifiers to reduce contract size

    /// @inheritdoc IOracleRouter
    function pause() external override onlyOwner {
        _pause();
    }

    /// @inheritdoc IOracleRouter
    function unpause() external override onlyOwner {
        _unpause();
    }

    /// @dev Used within FunctionsSubscriptions.sol
    function _onlyRouterOwner() internal view override {
        _validateOwnership();
    }

    /// @dev Used within OracleSubscriptions.sol
    function _whenNotPaused() internal view override {
        _requireNotPaused();
    }
}
