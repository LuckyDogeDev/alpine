certoraRun spec/harness/AlpineHarness.sol spec/harness/DummyERC20A.sol spec/harness/DummyWeth.sol spec/harness/SymbolicStrategy.sol spec/harness/Owner.sol  spec/harness/Borrower.sol \
    --link  SymbolicStrategy:receiver=AlpineHarness Borrower:alPine=AlpineHarness \
	--settings -copyLoopUnroll=4,-b=4,-ignoreViewFunctions,-enableStorageAnalysis=true,-assumeUnwindCond,-ciMode=true \
	--verify AlpineHarness:spec/alpine.spec \
	--cache alPine \
	--msg "Alpine"