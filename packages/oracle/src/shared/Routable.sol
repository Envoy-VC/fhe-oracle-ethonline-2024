// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ITypeAndVersion} from "./interfaces/ITypeAndVersion.sol";
import {IOwnableOracleRouter} from "../interfaces/IOwnableOracleRouter.sol";

/// @title This abstract should be inherited by contracts that will be used
/// as the destinations to a route (id=>contract) on the Router.
/// It provides a Router getter and modifiers.
abstract contract Routable is ITypeAndVersion {
    IOwnableOracleRouter private immutable i_oracleRouter;

    error RouterMustBeSet();
    error OnlyCallableByRouter();
    error OnlyCallableByRouterOwner();

    /// @dev Initializes the contract.
    constructor(address router) {
        if (router == address(0)) {
            revert RouterMustBeSet();
        }
        i_oracleRouter = IOwnableOracleRouter(router);
    }

    /// @notice Return the Router
    function _getRouter() internal view returns (IOwnableOracleRouter router) {
        return i_oracleRouter;
    }

    /// @notice Reverts if called by anyone other than the router.
    modifier onlyRouter() {
        if (msg.sender != address(i_oracleRouter)) {
            revert OnlyCallableByRouter();
        }
        _;
    }

    /// @notice Reverts if called by anyone other than the router owner.
    modifier onlyRouterOwner() {
        if (msg.sender != i_oracleRouter.owner()) {
            revert OnlyCallableByRouterOwner();
        }
        _;
    }
}
