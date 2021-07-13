// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
import "../interfaces/IStrategy.sol";
import "@boringcrypto/boring-solidity/contracts/BoringOwnable.sol";
import "@boringcrypto/boring-solidity/contracts/libraries/BoringMath.sol";
import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";

// solhint-disable not-rely-on-time

interface IAlchemyBench is IERC20 {
    function enter(uint256 _amount) external;

    function leave(uint256 _share) external;
}

contract GoldNuggetStrategy is IStrategy, BoringOwnable {
    using BoringMath for uint256;
    using BoringERC20 for IERC20;

    IERC20 private immutable goldnugget;
    IAlchemyBench private immutable alchemybench;

    constructor(IAlchemyBench alchemybench_, IERC20 goldnugget_) public {
        alchemybench = alchemybench_;
        goldnugget = goldnugget_;
    }

    // Send the assets to the Strategy and call skim to invest them
    /// @inheritdoc IStrategy
    function skim(uint256 amount) external override {
        goldnugget.approve(address(alchemybench), amount);
        alchemybench.enter(amount);
    }

    // Harvest any profits made converted to the asset and pass them to the caller
    /// @inheritdoc IStrategy
    function harvest(uint256 balance, address) external override onlyOwner returns (int256 amountAdded) {
        uint256 share = alchemybench.balanceOf(address(this));
        uint256 totalShares = alchemybench.totalSupply();
        uint256 totalGoldNugget = goldnugget.balanceOf(address(alchemybench));
        uint256 keepShare = balance.mul(totalShares) / totalGoldNugget;
        uint256 harvestShare = share.sub(keepShare);
        alchemybench.leave(harvestShare);
        amountAdded = int256(goldnugget.balanceOf(address(this)));
        goldnugget.safeTransfer(owner, uint256(amountAdded)); // Add as profit
    }

    // Withdraw assets. The returned amount can differ from the requested amount due to rounding or if the request was more than there is.
    /// @inheritdoc IStrategy
    function withdraw(uint256 amount) external override onlyOwner returns (uint256 actualAmount) {
        uint256 totalShares = alchemybench.totalSupply();
        uint256 totalGoldNugget = goldnugget.balanceOf(address(alchemybench));
        uint256 withdrawShare = amount.mul(totalShares) / totalGoldNugget;
        uint256 share = alchemybench.balanceOf(address(this));
        if (withdrawShare > share) {
            withdrawShare = share;
        }
        alchemybench.leave(withdrawShare);
        actualAmount = goldnugget.balanceOf(address(this));
        goldnugget.safeTransfer(owner, actualAmount);
    }

    // Withdraw all assets in the safest way possible. This shouldn't fail.
    /// @inheritdoc IStrategy
    function exit(uint256 balance) external override onlyOwner returns (int256 amountAdded) {
        uint256 share = alchemybench.balanceOf(address(this));
        alchemybench.leave(share);

        uint256 amount = goldnugget.balanceOf(address(this));
        amountAdded = int256(amount) - int256(balance);
        goldnugget.safeTransfer(owner, amount);
    }
}
