// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleResponse} from "../libraries/OracleResponse.sol";

/// @title FHE Oracle Coordinator interface.
interface IOracleCoordinator {
    /// @notice Receives a request to be emitted to the Oracle for processing
    /// @param request The request metadata
    /// @dev see the struct for field descriptions
    /// @return commitment - The parameters of the request that must be held consistent at response time
    function startRequest(OracleResponse.RequestMeta calldata request)
        external
        returns (OracleResponse.Commitment memory commitment);

    /// @notice Remove a request commitment that the Router has determined to be stale
    /// @param requestId - The request ID to remove
    function deleteCommitment(bytes32 requestId) external;
}
