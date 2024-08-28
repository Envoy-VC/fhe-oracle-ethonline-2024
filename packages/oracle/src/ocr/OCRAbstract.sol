// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ITypeAndVersion} from "../shared/interfaces/ITypeAndVersion.sol";

abstract contract OCRAbstract is ITypeAndVersion {
    uint256 internal constant MAX_NUM_ORACLES = 31;

    struct OCRConfig {
        // number of oracles the protocol is configured to support
        uint256 maxOracles;
        // block in which the previous config was set, to simplify historic analysis
        uint32 previousConfigBlockNumber;
        // configDigest of this configuration
        bytes32 configDigest;
    }

    /**
     * @notice triggers a new run of the offchain reporting protocol
     * @param maxOracles number of oracles the protocol is configured to support
     * @param previousConfigBlockNumber block in which the previous config was set, to simplify historic analysis
     * @param configDigest configDigest of this configuration
     */
    event ConfigSet(uint256 maxOracles, uint32 previousConfigBlockNumber, bytes32 configDigest);

    /**
     * @notice sets offchain reporting protocol configuration
     * @param config configuration to set
     */
    function setConfig(OCRConfig memory config) external virtual;

    function addOracle(address transmitter) external virtual;
    function removeOracle(address transmitter) external virtual;

    /**
     * @notice information about current offchain reporting protocol configuration
     * @return config configuration of the current protocol
     */
    function latestConfigDetails() external view virtual returns (OCRConfig memory config);

    /**
     * @notice transmit is called to post a new report to the contract
     * @param report serialized report, which the signatures are signing.
     * @param rs ith element is the R components of the ith signature on report. Must have at most maxNumOracles entries
     * @param ss ith element is the S components of the ith signature on report. Must have at most maxNumOracles entries
     * @param rawVs ith element is the the V component of the ith signature
     */
    function transmit(
        address[] calldata signers,
        bytes calldata report,
        bytes32 reportHash,
        bytes32[] calldata rs,
        bytes32[] calldata ss,
        uint8[] calldata rawVs
    ) external virtual;
}
