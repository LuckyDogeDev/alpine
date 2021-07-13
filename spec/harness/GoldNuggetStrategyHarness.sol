pragma solidity 0.6.12;

import "./StrategyHarness.sol";
import "../../contracts/strategies/GoldNuggetStrategy.sol";

contract GoldNuggetStrategyHarness is StrategyHarness, GoldNuggetStrategy {
    constructor(IAlchemyBench alchemybench_, IERC20 goldnugget_) GoldNuggetStrategy(alchemybench_, goldnugget_) public { }

    function receiver() public returns (address) {
		return owner;
	}
}