certoraRun spec/harness/GoldNuggetStrategyHarness.sol \
spec/harness/DummyERC20A.sol \
spec/harness/Receiver.sol \
--link GoldNuggetStrategyHarness:goldnugget=DummyERC20A GoldNuggetStrategyHarness:owner=Receiver \
--verify GoldNuggetStrategyHarness:spec/strategy.spec \
--cloud \
--settings -ciMode=true \
--msg "goldnuggetStrategy"