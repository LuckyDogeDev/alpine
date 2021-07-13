// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;
import "../Alpine.sol";

// An example a contract that stores tokens in the Alpine.
// A single contract that users can approve for the Alpine, hence the registerProtocol call.
// PS. This isn't good code, just kept it simple to illustrate usage.
contract HelloWorld {
    Alpine public alPine;
    IERC20 public token;

    constructor(Alpine _alPine, IERC20 _token) public {
        alPine = _alPine;
        token = _token;
        alPine.registerProtocol();
    }

    mapping(address => uint256) public alPineShares;

    // Deposits an amount of token into the Alpine. Alpine shares are given to the HelloWorld contract and
    // assigned to the user in alPineShares.
    // Don't deposit twice, you'll lose the first deposit ;)
    function deposit(uint256 amount) public {
        (, alPineShares[msg.sender]) = alPine.deposit(token, msg.sender, address(this), amount, 0);
    }

    // This will return the current value in amount of the Alpine shares.
    // Through flash loans and maybe a strategy, the value can go up over time.
    function balance() public view returns (uint256 amount) {
        return alPine.toAmount(token, alPineShares[msg.sender], false);
    }

    // Withdraw all shares from the Alpine and receive the token.
    function withdraw() public {
        alPine.withdraw(token, address(this), msg.sender, 0, alPineShares[msg.sender]);
    }
}
