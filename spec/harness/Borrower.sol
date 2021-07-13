pragma solidity 0.6.12;
import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";
import "../../contracts/Alpine.sol";


contract Borrower {

    fallback() external payable { }
    receive() external payable { }

    Alpine public alPine ;
    uint256 send;

    uint256 public callBack;

    address from;
    address to; 
    uint256 amount; 
    uint256 share;
    bool balance; 
    uint256 maxChangeAmount;

    function onFlashLoan(
        address sender, 
        IERC20 token, 
        uint256 amount, 
        uint256 fee, 
        bytes calldata data) external 
    {
        if (callBack == 1)
            alPine.deposit(token, from, to, amount, share);
        else if(callBack == 2)
            alPine.withdraw(token, from, to, amount, share);
        else if(callBack == 3)
            alPine.transfer(token, from, to, share);
        else if(callBack == 4)
            alPine.harvest(token, balance, maxChangeAmount);
        token.transfer(address(alPine), send);
    }

    uint256[] sends;
    function onBatchFlashLoan(
        address sender,
        IERC20[] calldata tokens,
        uint256[] calldata amounts,
        uint256[] calldata fees,
        bytes calldata data
    ) external {
        uint256 len = tokens.length;
        for (uint256 i = 0; i < len; i++) {
            tokens[i].transfer(address(alPine), sends[i]);
        }
    }

}
