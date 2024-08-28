// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleRouter} from "./interfaces/IOracleRouter.sol";
import {IOracleClient} from "./interfaces/IOracleClient.sol";

import {OracleRequest} from "./libraries/OracleRequest.sol";

/// @title The FHE Oracle client contract
/// @notice Contract developers can inherit this contract in order to make Oracle requests
abstract contract OracleClient is IOracleClient {
    using OracleRequest for OracleRequest.Request;

    IOracleRouter internal immutable i_oracleRouter;

    event RequestSent(bytes32 indexed id);
    event RequestFulfilled(bytes32 indexed id);

    error OnlyRouterCanFulfill();

    constructor(address router) {
        i_oracleRouter = IOracleRouter(router);
    }

    /// @notice Sends a FHE Oracle request
    /// @param data The CBOR encoded bytes data for a Oracle request
    /// @param subscriptionId The subscription ID that will be charged to service the request
    /// @param callbackGasLimit - The amount of gas that will be available for the fulfillment callback
    /// @return requestId The generated request ID for this request
    function _sendRequest(bytes memory data, uint64 subscriptionId, uint32 callbackGasLimit)
        internal
        returns (bytes32)
    {
        bytes32 requestId = i_oracleRouter.sendRequest(subscriptionId, data, callbackGasLimit);
        emit RequestSent(requestId);
        return requestId;
    }

    /// @notice User defined function to handle a response from the Oracle
    /// @param requestId The request ID, returned by sendRequest()
    /// @param response Aggregated response from the execution of the user's source code
    /// @param err Aggregated error from the execution of the user code or from the execution pipeline
    /// @dev Either response or error parameter will be set, but never both
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal virtual;

    /// @inheritdoc IOracleClient
    function handleOracleFulfillment(bytes32 requestId, bytes memory response, bytes memory err) external override {
        if (msg.sender != address(i_oracleRouter)) {
            revert OnlyRouterCanFulfill();
        }
        _fulfillRequest(requestId, response, err);
        emit RequestFulfilled(requestId);
    }
}
