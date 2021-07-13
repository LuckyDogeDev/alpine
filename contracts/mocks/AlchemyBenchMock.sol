// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
import "@boringcrypto/boring-solidity/contracts/ERC20.sol";
import "@boringcrypto/boring-solidity/contracts/libraries/BoringMath.sol";

// solhint-disable const-name-snakecase

// AlchemyBench is the coolest alchemybench in town. You come in with some GoldNugget, and leave with more! The longer you stay, the more GoldNugget you get.
// This contract handles swapping to and from PlatinumNugget, LuckySwap's staking token.
contract AlchemyBenchMock is ERC20 {
    using BoringMath for uint256;
    ERC20 public goldnugget;
    uint256 public totalSupply;
    string public constant name = "AlchemyBench";
    string public constant symbol = "PlatinumNugget";

    // Define the GoldNugget token contract
    constructor(ERC20 _goldnugget) public {
        goldnugget = _goldnugget;
    }

    // Enter the alchemybench. Pay some GOLNs. Earn some shares.
    // Locks GoldNugget and mints PlatinumNugget
    function enter(uint256 _amount) public {
        // Gets the amount of GoldNugget locked in the contract
        uint256 totalGoldNugget = goldnugget.balanceOf(address(this));
        // Gets the amount of PlatinumNugget in existence
        uint256 totalShares = totalSupply;
        // If no PlatinumNugget exists, mint it 1:1 to the amount put in
        if (totalShares == 0 || totalGoldNugget == 0) {
            _mint(msg.sender, _amount);
        }
        // Calculate and mint the amount of PlatinumNugget the GoldNugget is worth. The ratio will change overtime,
        // as PlatinumNugget is burned/minted and GoldNugget deposited + gained from fees / withdrawn.
        else {
            uint256 what = _amount.mul(totalShares) / totalGoldNugget;
            _mint(msg.sender, what);
        }
        // Lock the GoldNugget in the contract
        goldnugget.transferFrom(msg.sender, address(this), _amount);
    }

    // Leave the alchemybench. Claim back your GOLNs.
    // Unclocks the staked + gained GoldNugget and burns PlatinumNugget
    function leave(uint256 _share) public {
        // Gets the amount of PlatinumNugget in existence
        uint256 totalShares = totalSupply;
        // Calculates the amount of GoldNugget the PlatinumNugget is worth
        uint256 what = _share.mul(goldnugget.balanceOf(address(this))) / totalShares;
        _burn(msg.sender, _share);
        goldnugget.transfer(msg.sender, what);
    }

    function _mint(address account, uint256 amount) internal {
        totalSupply = totalSupply.add(amount);
        balanceOf[account] = balanceOf[account].add(amount);
        emit Transfer(address(0), account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        balanceOf[account] = balanceOf[account].sub(amount);
        totalSupply = totalSupply.sub(amount);
        emit Transfer(account, address(0), amount);
    }
}
