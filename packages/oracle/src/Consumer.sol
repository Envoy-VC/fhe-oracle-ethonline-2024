// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleClient} from "./OracleClient.sol";
import {ConfirmedOwner} from "./shared/access/ConfirmedOwner.sol";
import {OracleRequest} from "./libraries/OracleRequest.sol";

import {euint256, FHE} from "@fhenixprotocol/contracts/FHE.sol";
import "@fhenixprotocol/contracts/access/Permissioned.sol";

contract ConsumerExample is OracleClient, ConfirmedOwner, Permissioned {
    using OracleRequest for OracleRequest.Request;

    bytes32 public s_lastRequestId;
    bytes public s_lastResponse;
    bytes public s_lastError;

    euint256 public lastResponse;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);

    constructor(address router) OracleClient(router) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Send a simple request
     * @param subscriptionId Subscription ID
     * @param source Source code
     * @param location Location of the source code
     * @param publicArgs Public arguments
     * @param privateArgs Private arguments
     */
    function sendRequest(
        uint64 subscriptionId,
        string memory source,
        OracleRequest.Location location,
        bytes memory publicArgs,
        bytes memory privateArgs,
        uint32 gasLimit
    ) external returns (bytes32 requestId) {
        OracleRequest.Request memory req;
        if (location == OracleRequest.Location.Inline) {
            req._initializeRequestForInlineJavaScript(source);
        } else {
            req._initializeRequest(location, OracleRequest.CodeLanguage.JavaScript, source);
        }
        req._setArgs(publicArgs, privateArgs);
        s_lastRequestId = _sendRequest(req._encodeCBOR(), subscriptionId, gasLimit);
        return s_lastRequestId;
    }

    /**
     * @notice Send a pre-encoded CBOR request
     * @param subscriptionId Subscription Id
     * @param request CBOR-encoded request data
     * @param gasLimit The maximum amount of gas the request can consume
     * @return requestId The ID of the sent request
     */
    function sendRequestCBOR(bytes memory request, uint64 subscriptionId, uint32 gasLimit)
        external
        returns (bytes32 requestId)
    {
        s_lastRequestId = _sendRequest(request, subscriptionId, gasLimit);
        return s_lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function _fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;
        lastResponse = FHE.asEuint256(s_lastResponse);
        emit Response(requestId, s_lastResponse, s_lastError);
    }

    function getLastResponse(Permission calldata perm) public view returns (string memory) {
        return FHE.sealoutput(lastResponse, perm.publicKey);
    }
}
