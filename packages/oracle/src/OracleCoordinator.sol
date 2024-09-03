// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleCoordinator} from "./interfaces/IOracleCoordinator.sol";
import {ITypeAndVersion} from "./shared/interfaces/ITypeAndVersion.sol";

import {OracleResponse} from "./libraries/OracleResponse.sol";
import {OCRBase} from "./ocr/OCRBase.sol";
import {Routable} from "./shared/Routable.sol";

import {ConfirmedOwner} from "./shared/access/ConfirmedOwner.sol";

/// @title FHE Oracle Coordinator contract
/// @notice Contract that nodes of a Oracle Network interact with
contract OracleCoordinator is IOracleCoordinator, OCRBase, Routable, ConfirmedOwner {
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

    event RequestSent(
        bytes32 indexed requestId,
        address indexed requestingContract,
        address requestInitiator,
        uint64 subscriptionId,
        address subscriptionOwner,
        bytes data,
        uint64 callbackGasLimit,
        OracleResponse.Commitment commitment
    );
    event ResponseReceived(bytes32 indexed requestId, address transmitter);

    error InconsistentReportData();
    error EmptyPublicKey();
    error UnauthorizedPublicKeyChange();

    constructor(address _initialOwner, address router, OracleConfig memory _config)
        OCRBase()
        Routable(router)
        ConfirmedOwner(_initialOwner)
    {
        updateConfig(_config);
    }

    // ================================================================
    // |                        Configuration                         |
    // ================================================================

    /// @notice Gets the Oracle Coordinator configuration
    /// @return config Coordinator configuration
    function getConfig() external view returns (OracleConfig memory) {
        return s_config;
    }

    /// @notice Sets the Oracle Coordinator configuration
    /// @param config The new configuration
    function updateConfig(OracleConfig memory config) public {
        _onlyOwner();

        s_config = config;
        emit ConfigUpdated(config);
    }

    function setConfig(OCRConfig memory config) public override {
        _onlyOwner();
        _setConfig(config);
    }

    // ===================================================================
    // |                      Oracle Transmitters                        |
    // ===================================================================

    function addOracleNode(address transmitter) public override {
        _onlyOwner();
        _addOracle(transmitter);
    }

    function removeOracleNode(address transmitter) public override {
        _onlyOwner();
        _addOracle(transmitter);
    }

    function isOracleNode(address transmitter) public view override returns (bool) {
        return _isOracleNode(transmitter);
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

        emit RequestSent(
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

    // ===================================================================
    // |                        Response Logic                            |
    // ===================================================================

    function _isExistingRequest(bytes32 requestId) internal view returns (bool) {
        return s_requestCommitments[requestId] != bytes32(0);
    }

    function _beforeTransmit(bytes calldata report)
        internal
        view
        override
        returns (bool shouldStop, DecodedReport memory decodedReport)
    {
        (bytes32[] memory requestIds, bytes[] memory results, bytes[] memory errors, bytes[] memory onchainMetadata) =
            abi.decode(report, (bytes32[], bytes[], bytes[], bytes[]));

        uint256 numberOfFulfillments = uint8(requestIds.length);

        if (
            numberOfFulfillments == 0 || numberOfFulfillments != results.length || numberOfFulfillments != errors.length
                || numberOfFulfillments != onchainMetadata.length
        ) {
            revert ReportInvalid("Fields must be equal length");
        }

        for (uint256 i = 0; i < numberOfFulfillments; ++i) {
            if (_isExistingRequest(requestIds[i])) {
                // If there is an existing request, validate report Leave shouldStop to default, false
                break;
            }
            if (i == numberOfFulfillments - 1) {
                // If the last fulfillment on the report does not exist, then all are duplicates
                // Indicate that it's safe to stop to save on the gas of validating the report
                shouldStop = true;
            }
        }

        return (
            shouldStop,
            DecodedReport({requestIds: requestIds, results: results, errors: errors, onchainMetadata: onchainMetadata})
        );
    }

    function _report(DecodedReport memory decodedReport) internal override {
        uint256 numberOfFulfillments = uint8(decodedReport.requestIds.length);

        for (uint256 i = 0; i < numberOfFulfillments; ++i) {
            OracleResponse.FulfillResult result = OracleResponse.FulfillResult(
                _fulfill(
                    decodedReport.requestIds[i],
                    decodedReport.results[i],
                    decodedReport.errors[i],
                    decodedReport.onchainMetadata[i]
                )
            );

            if (
                result == OracleResponse.FulfillResult.FULFILLED
                    || result == OracleResponse.FulfillResult.USER_CALLBACK_ERROR
            ) {
                emit ResponseReceived(decodedReport.requestIds[i], msg.sender);
            }
        }
    }

    /// @notice Finalize pipeline for an Oracle request by sending a callback to the Client contract
    /// @param requestId identifier for the request that was generated by the Registry in the beginning of the request
    /// @param response response data from Oracle
    /// @param err error from Oracle
    /// @return result fulfillment result
    /// @dev Only callable by a node that has been approved on the Coordinator
    /// @dev simulated offchain to determine if sufficient balance is present to fulfill the request
    function _fulfill(bytes32 requestId, bytes memory response, bytes memory err, bytes memory onchainMetadata)
        internal
        returns (OracleResponse.FulfillResult)
    {
        OracleResponse.Commitment memory commitment = abi.decode(onchainMetadata, (OracleResponse.Commitment));

        // The Functions Router will perform the callback to the client contract
        (OracleResponse.FulfillResult resultCode) = _getRouter().fulfill(response, err, msg.sender, commitment);

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
    /// @dev Used by OracleConfigRouter.sol during timeout of a request
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
