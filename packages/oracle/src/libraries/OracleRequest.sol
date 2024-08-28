// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {CBOR} from "./CBOR.sol";

/// @title Library for encoding the input data of a Oracle request into CBOR
library OracleRequest {
    using CBOR for CBOR.CBORBuffer;

    uint16 public constant REQUEST_DATA_VERSION = 1;
    uint256 internal constant DEFAULT_BUFFER_SIZE = 256;

    enum Location {
        Inline, // Provided within the Request
        IPFS // Hosted on IPFS that can be accessed through a provided CID.

    }

    enum CodeLanguage {
        JavaScript
    }
    // In future version we may add other languages

    struct Argument {
        string key;
        string value;
    }

    struct Request {
        // Location of the source code that will be executed on Lit Nodes.
        Location codeLocation;
        // The coding language that the source code is written in
        CodeLanguage language;
        // Source Code: CID for Location.IPFS, or raw source code for Location.Inline.
        string source;
        // Arguments for the request
        Argument[] args;
    }

    error EmptySource();
    error EmptySecrets();
    error EmptyArgs();

    /// @notice Encodes a Request to CBOR encoded bytes
    /// @param self The request to encode
    /// @return CBOR encoded bytes
    function _encodeCBOR(Request memory self) internal pure returns (bytes memory) {
        CBOR.CBORBuffer memory buffer = CBOR.create(DEFAULT_BUFFER_SIZE);

        buffer.writeString("codeLocation");
        buffer.writeUInt256(uint256(self.codeLocation));

        buffer.writeString("language");
        buffer.writeUInt256(uint256(self.language));

        buffer.writeString("source");
        buffer.writeString(self.source);

        if (self.args.length > 0) {
            buffer.writeString("args");
            buffer.startArray();
            for (uint256 i = 0; i < self.args.length; ++i) {
                buffer.writeKVString(self.args[i].key, self.args[i].value);
            }
            buffer.endSequence();
        }

        return buffer.buf.buf;
    }

    /// @notice Initializes a Oracle Request
    /// @dev Sets the codeLocation and code on the request
    /// @param self The uninitialized request
    /// @param codeLocation The user provided source code location
    /// @param language The programming language of the user code
    /// @param source The user provided source code or a url
    function _initializeRequest(Request memory self, Location codeLocation, CodeLanguage language, string memory source)
        internal
        pure
    {
        if (bytes(source).length == 0) revert EmptySource();

        self.codeLocation = codeLocation;
        self.language = language;
        self.source = source;
    }

    /// @notice Initializes a Chainlink Functions Request
    /// @dev Simplified version of initializeRequest for PoC
    /// @param self The uninitialized request
    /// @param javaScriptSource The user provided JS code (must not be empty)
    function _initializeRequestForInlineJavaScript(Request memory self, string memory javaScriptSource) internal pure {
        _initializeRequest(self, Location.Inline, CodeLanguage.JavaScript, javaScriptSource);
    }

    /// @notice Sets args for the user run function
    /// @param self The initialized request
    /// @param args The array of string args (must not be empty)
    function _setArgs(Request memory self, Argument[] memory args) internal pure {
        if (args.length == 0) revert EmptyArgs();
        self.args = args;
    }
}
