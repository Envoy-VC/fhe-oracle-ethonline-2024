// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {OracleResponse} from "../libraries/OracleResponse.sol";

/// @title FHE Oracle Router interface.
interface IOracleRouter {
    /// @notice Sends a request using the provided subscriptionId
    /// @param subscriptionId - A unique subscription ID.
    /// A client can make requests from different contracts referencing the same subscription
    /// @param data - CBOR encoded FHE Oracle request data, use OracleRequest API to encode a request
    /// @param callbackGasLimit - Gas limit for the fulfillment callback
    /// @return requestId - A unique request identifier
    function sendRequest(uint64 subscriptionId, bytes calldata data, uint32 callbackGasLimit)
        external
        returns (bytes32);

    /// @notice Fulfill the request by calling back the data that the Oracle returned to the client contract
    /// @dev Only callable by the Coordinator contract that is saved in the commitment
    /// @param response response data from DON consensus
    /// @param err error from DON consensus
    /// @param transmitter - The Node that transmitted the OCR report
    /// @param commitment - The parameters of the request that must be held consistent between request and response time
    /// @return fulfillResult - The result of the fulfillment
    function fulfill(
        bytes memory response,
        bytes memory err,
        address transmitter,
        OracleResponse.Commitment memory commitment
    ) external returns (OracleResponse.FulfillResult, uint96);

    /// @notice Validate requested gas limit is below the subscription max.
    /// @param subscriptionId subscription ID
    /// @param callbackGasLimit desired callback gas limit
    function isValidCallbackGasLimit(uint64 subscriptionId, uint32 callbackGasLimit) external view;

    /// @dev Puts the system into an emergency stopped state.
    /// @dev Only callable by owner
    function pause() external;

    /// @dev Takes the system out of an emergency stopped state.
    /// @dev Only callable by owner
    function unpause() external;
}
