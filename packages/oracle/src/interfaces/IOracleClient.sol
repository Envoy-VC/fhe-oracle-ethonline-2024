// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title FHE Oracle client interface.
interface IOracleClient {
    /// @notice Oracle response handler called by the Oracle Router
    /// @param requestId The requestId returned by FunctionsClient.sendRequest().
    /// @param response Aggregated response from the request's source code.
    /// @param error Aggregated error either from the request's source code or from the execution pipeline.
    /// @dev Either response or error parameter will be set, but never both.
    function handleOracleFulfillment(bytes32 requestId, bytes memory response, bytes memory error) external;
}
