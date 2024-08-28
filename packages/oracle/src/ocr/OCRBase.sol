// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ConfirmedOwner} from "../shared/access/ConfirmedOwner.sol";
import {OCRAbstract} from "./OCRAbstract.sol";

/**
 * @notice Onchain verification of reports from the offchain reporting protocol
 */
abstract contract OCRBase is OCRAbstract {
    error ReportInvalid(string message);
    error InvalidConfig(string message);
    error OracleAlreadyExists(address transmitter);
    error NonExistentOracle(address transmitter);

    event OracleAdded(address transmitter);
    event OracleRemoved(address transmitter);

    constructor() {}

    uint8 internal s_oracleCount;
    // Incremented each time a new config is posted.
    uint32 internal s_configCount;
    // makes it easier for off-chain systems to extract config from logs.
    uint32 internal s_latestConfigBlockNumber;

    OCRConfig internal s_configInfo;

    // To track the purpose of the address, or to indicate that the address is unset.
    enum Role {
        // No oracle role has been set for address a
        Unset,
        // Transmission address for transmitting reports to the contract
        Transmitter
    }

    struct Oracle {
        uint8 index; // Index of oracle
        Role role; // Role of the address which mapped to this struct
    }

    struct DecodedReport {
        bytes32[] requestIds;
        bytes[] results;
        bytes[] errors;
        bytes[] onchainMetadata;
    }

    mapping(address transmitter => Oracle) internal s_oracles;

    // Reverts transaction if config args are invalid
    modifier checkConfigValid(OCRConfig memory config) {
        if (config.maxOracles > MAX_NUM_ORACLES) revert InvalidConfig("too many oracles");
        _;
    }

    function _setConfig(OCRConfig memory config) internal checkConfigValid(config) {
        bytes32 latestDigest = _configDigestFromConfigData(block.chainid, address(this), s_configCount);
        OCRConfig memory args = OCRConfig({
            maxOracles: config.maxOracles,
            previousConfigBlockNumber: s_latestConfigBlockNumber,
            configDigest: latestDigest
        });

        uint32 previousConfigBlockNumber = s_latestConfigBlockNumber;

        s_latestConfigBlockNumber = uint32(block.number);
        s_configCount += 1;
        s_configInfo = args;

        emit ConfigSet(config.maxOracles, previousConfigBlockNumber, latestDigest);
    }

    function _configDigestFromConfigData(uint256 _chainId, address _contractAddress, uint64 _configCount)
        internal
        pure
        returns (bytes32)
    {
        uint256 h = uint256(keccak256(abi.encode(_chainId, _contractAddress, _configCount)));
        uint256 prefixMask = type(uint256).max << (256 - 16); // 0xFFFF00..00
        uint256 prefix = 0x0001 << (256 - 16); // 0x000100..00
        return bytes32(prefix | (h & ~prefixMask));
    }

    /**
     * @notice information about current offchain reporting protocol configuration
     * @return config configuration of the current protocol
     */
    function latestConfigDetails() external view override returns (OCRConfig memory config) {
        return s_configInfo;
    }

    /**
     * @dev hook called after the report has been fully validated
     * for the extending contract to handle additional logic, such as oracle payment
     * @param decodedReport decodedReport
     */
    function _report(DecodedReport memory decodedReport) internal virtual;

    function _addOracle(address transmitter) internal {
        // Check if the Oracle Exists
        Oracle memory oracle = s_oracles[transmitter];

        if (oracle.role != Role.Unset) {
            revert OracleAlreadyExists(transmitter);
        }

        ++s_oracleCount;

        s_oracles[transmitter] = Oracle({index: s_oracleCount, role: Role.Transmitter});

        emit OracleAdded(transmitter);
    }

    function _removeOracle(address transmitter) internal {
        Oracle memory oracle = s_oracles[transmitter];

        if (oracle.role == Role.Unset) {
            revert NonExistentOracle(transmitter);
        }

        --s_oracleCount;

        delete s_oracles[transmitter];

        emit OracleRemoved(transmitter);
    }

    function _beforeTransmit(bytes calldata report)
        internal
        virtual
        returns (bool shouldStop, DecodedReport memory decodedReport);

    /**
     * @notice transmit is called to post a new report to the contract
     * @param reportHash serialized report hash, which the transmitters are signing.
     * @param rs ith element is the R components of the ith signature on report. Must have at most maxNumOracles entries
     * @param ss ith element is the S components of the ith signature on report. Must have at most maxNumOracles entries
     * @param vs ith element is the the V component of the ith signature
     */
    function transmit(
        address[] calldata signers,
        bytes calldata report,
        bytes32 reportHash,
        bytes32[] calldata rs,
        bytes32[] calldata ss,
        uint8[] calldata vs
    ) external override {
        (bool shouldStop, DecodedReport memory decodedReport) = _beforeTransmit(report);

        if (shouldStop) {
            return;
        }

        {
            uint256 expectedNumSignatures = signers.length;

            if (rs.length != expectedNumSignatures) revert ReportInvalid("wrong number of signatures");
            if (rs.length != ss.length) revert ReportInvalid("report rs and ss must be of equal length");

            Oracle memory transmitter = s_oracles[msg.sender];
            if (transmitter.role != Role.Transmitter) {
                revert ReportInvalid("unauthorized transmitter");
            }
        }

        address[MAX_NUM_ORACLES] memory signed;

        {
            Oracle memory o;
            for (uint256 i = 0; i < rs.length; ++i) {
                address signer = ecrecover(reportHash, vs[i], rs[i], ss[i]);
                o = s_oracles[signer];
                if (o.role != Role.Transmitter) revert ReportInvalid("address not authorized to Transmit");
                if (signed[o.index] != address(0)) revert ReportInvalid("non-unique signature");
                signed[o.index] = signer;
            }
        }

        _report(decodedReport);
    }
}
