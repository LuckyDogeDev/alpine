certoraRun spec/harness/AlpineHarness.sol spec/harness/DummyERC20A.sol spec/harness/DummyERC20B.sol spec/harness/DummyWeth.sol spec/harness/CompoundStrategyHarness.sol spec/harness/Owner.sol spec/harness/Borrower.sol spec/harness/Receiver.sol spec/compound/CErc20.sol \
    --link Borrower:alPine=AlpineHarness CompoundStrategyHarness:token=DummyERC20A CompoundStrategyHarness:owner=Owner CompoundStrategyHarness:alpine=AlpineHarness CompoundStrategyHarness:cToken=CErc20 CompoundStrategyHarness:compToken=DummyERC20B CErc20:underlying=DummyERC20A \
	--settings -copyLoopUnroll=4,-b=4,-ignoreViewFunctions,-enableStorageAnalysis=true,-assumeUnwindCond \
	--verify AlpineHarness:spec/alPineCompoundStrategy.spec \
	--solc_map AlpineHarness=solc6.12,DummyWeth=solc6.12,Borrower=solc6.12,CompoundStrategyHarness=solc6.12,CErc20=solc5.17,DummyERC20A=solc6.12,Owner=solc6.12,Receiver=solc6.12,DummyERC20B=solc6.12 --path $PWD \
	--cache alPine \
	--staging production \
	--msg "Alpine with compound strategy April 18"