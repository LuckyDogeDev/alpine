// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;
import "../Alpine.sol";

contract AlpineMock is Alpine {
    constructor(IERC20 weth) public Alpine(weth) {
        return;
    }

    function addProfit(IERC20 token, uint256 amount) public {
        token.safeTransferFrom(msg.sender, address(this), amount);
        totals[token].addElastic(amount);
    }
}
