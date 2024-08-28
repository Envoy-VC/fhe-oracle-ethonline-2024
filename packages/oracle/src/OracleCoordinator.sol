// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";
import {ITypeAndVersion} from "./shared/interfaces/ITypeAndVersion.sol";

import {OracleResponse} from "./libraries/OracleResponse.sol";
import {Routable} from "./shared/Routable.sol";

import {ConfirmedOwner} from "./shared/access/ConfirmedOwner.sol";

/// @title FHE Oracle Coordinator contract
/// @notice Contract that nodes of a Oracle Network interact with
contract OracleCoordinator is IOracleCoordinator, ITypeAndVersion, Routable, ConfirmedOwner {
    using OracleResponse for OracleResponse.RequestMeta;
    using OracleResponse for OracleResponse.Commitment;
    using OracleResponse for OracleResponse.FulfillResult;

    event CommitmentDeleted(bytes32 requestId);

    /// @inheritdoc ITypeAndVersion
    string public constant override typeAndVersion = "FHE Oracle Coordinator v0.0.1";

    // ===================================================================
    // |              Oracle Request Commitment state                    |
    // ===================================================================

    mapping(bytes32 requestId => bytes32 commitmentHash) private s_requestCommitments;

    // ===================================================================
    // |                        Oracle Config                            |
    // ===================================================================

    struct OracleConfig {
        uint32 requestTimeoutSeconds;
    }

    OracleConfig private s_config;

    event ConfigUpdated(OracleConfig config);

    event Request(
        bytes32 indexed requestId,
        address indexed requestingContract,
        address requestInitiator,
        uint64 subscriptionId,
        address subscriptionOwner,
        bytes data,
        uint64 callbackGasLimit,
        OracleResponse.Commitment commitment
    );
    event Response(bytes32 indexed requestId, address transmitter);

    error InconsistentReportData();
    error EmptyPublicKey();
    error UnauthorizedPublicKeyChange();

    constructor(address _initialOwner, address router, OracleConfig memory _config)
        Routable(router)
        ConfirmedOwner(_initialOwner)
    {
        updateConfig(_config);
    }

    // ================================================================
    // |                        Configuration                         |
    // ================================================================

    /// @notice Gets the Chainlink Coordinator's billing configuration
    /// @return config
    function getConfig() external view returns (OracleConfig memory) {
        return s_config;
    }

    /// @notice Sets the Chainlink Coordinator's billing configuration
    /// @param config - See the contents of the FunctionsBillingConfig struct in IFunctionsBilling.sol for more information
    function updateConfig(OracleConfig memory config) public {
        _onlyOwner();

        s_config = config;
        emit ConfigUpdated(config);
    }

    // ===================================================================
    // |                        Request Logic                            |
    // ===================================================================

    /// @inheritdoc IOracleCoordinator
    function startRequest(OracleResponse.RequestMeta calldata request)
        external
        override
        onlyRouter
        returns (OracleResponse.Commitment memory commitment)
    {
        uint32 timeoutTimestamp = uint32(block.timestamp + s_config.requestTimeoutSeconds);
        bytes32 requestId = keccak256(
            abi.encode(
                address(this),
                request.requestingContract,
                request.subscriptionId,
                request.initiatedRequests + 1,
                keccak256(request.data),
                request.callbackGasLimit,
                timeoutTimestamp,
                // solhint-disable-next-line avoid-tx-origin
                tx.origin
            )
        );

        commitment = OracleResponse.Commitment({
            requestId: requestId,
            coordinator: address(this),
            client: request.requestingContract,
            subscriptionId: request.subscriptionId,
            callbackGasLimit: request.callbackGasLimit,
            timeoutTimestamp: timeoutTimestamp
        });

        s_requestCommitments[requestId] = keccak256(abi.encode(commitment));

        emit Request(
            commitment.requestId,
            request.requestingContract,
            // solhint-disable-next-line avoid-tx-origin
            tx.origin,
            request.subscriptionId,
            request.subscriptionOwner,
            request.data,
            request.callbackGasLimit,
            commitment
        );

        return commitment;
    }

    /// @notice Finalize billing process for an Functions request by sending a callback to the Client contract and then charging the subscription
    /// @param requestId identifier for the request that was generated by the Registry in the beginBilling commitment
    /// @param response response data from DON consensus
    /// @param err error from DON consensus
    /// @return result fulfillment result
    /// @dev Only callable by a node that has been approved on the Coordinator
    /// @dev simulated offchain to determine if sufficient balance is present to fulfill the request
    function _fulfillAndBill(bytes32 requestId, bytes memory response, bytes memory err, bytes memory onchainMetadata)
        internal
        returns (OracleResponse.FulfillResult)
    {
        OracleResponse.Commitment memory commitment = abi.decode(onchainMetadata, (OracleResponse.Commitment));

        // The Functions Router will perform the callback to the client contract
        (OracleResponse.FulfillResult resultCode) = _getRouter().fulfill(
            response,
            err,
            msg.sender,
            OracleResponse.Commitment({
                requestId: commitment.requestId,
                coordinator: commitment.coordinator,
                client: commitment.client,
                subscriptionId: commitment.subscriptionId,
                callbackGasLimit: commitment.callbackGasLimit,
                timeoutTimestamp: commitment.timeoutTimestamp
            })
        );

        // In these two fulfillment results the request will be deleted or else
        // request will be on hold.
        if (
            resultCode == OracleResponse.FulfillResult.FULFILLED
                || resultCode == OracleResponse.FulfillResult.USER_CALLBACK_ERROR
        ) {
            delete s_requestCommitments[requestId];
        }
        return resultCode;
    }

    // ================================================================
    // |                       Request Timeout                        |
    // ================================================================

    /// @inheritdoc IOracleCoordinator
    /// @dev Only callable by the Router
    /// @dev Used by FunctionsRouter.sol during timeout of a request
    function deleteCommitment(bytes32 requestId) external override onlyRouter {
        // Delete commitment
        delete s_requestCommitments[requestId];
        emit CommitmentDeleted(requestId);
    }

    /// @dev Validates ownership of the contract
    function _onlyOwner() internal view {
        _validateOwnership();
    }

    /// @dev Gets the owner of the contract
    function _owner() internal view returns (address owner) {
        return this.owner();
    }
}
