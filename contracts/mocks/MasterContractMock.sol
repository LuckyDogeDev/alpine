// SPDX-License-Identifier: UNLICENSED

pragma solidity 0.6.12;

import "@boringcrypto/boring-solidity/contracts/interfaces/IMasterContract.sol";
import "../Alpine.sol";

contract MasterContractMock is IMasterContract {
    Alpine public immutable alPine;

    constructor(Alpine _alPine) public {
        alPine = _alPine;
    }

    function deposit(IERC20 token, uint256 amount) public {
        alPine.deposit(token, msg.sender, address(this), 0, amount);
    }

    function init(bytes calldata) external payable override {
        return;
    }
}
