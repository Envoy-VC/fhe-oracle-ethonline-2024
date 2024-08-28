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
            OracleResponse.Commitment({
                requestId: commitment.requestId,
                coordinator: commitment.coordinator,
                client: commitment.client,
                subscriptionId: commitment.subscriptionId,
                callbackGasLimit: commitment.callbackGasLimit,
                timeoutTimestamp: commitment.timeoutTimestamp
            })
        );

        return commitment;
    }

    /// @dev Validates ownership of the contract
    function _onlyOwner() internal view {
        _validateOwnership();
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

    /// @dev Gets the owner of the contract
    function _owner() internal view returns (address owner) {
        return this.owner();
    }
}
