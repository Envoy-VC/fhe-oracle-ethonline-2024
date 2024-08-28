// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IOracleRouter} from "./IOracleRouter.sol";
import {IOwnable} from "../shared/interfaces/IOwnable.sol";

/// @title FHE Oracle Router interface with Ownability.
interface IOwnableOracleRouter is IOwnable, IOracleRouter {}
