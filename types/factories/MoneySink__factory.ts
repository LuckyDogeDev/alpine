/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import { Contract, ContractFactory, Overrides } from "@ethersproject/contracts";

import type { MoneySink } from "../MoneySink";

export class MoneySink__factory extends ContractFactory {
  constructor(signer?: Signer) {
    super(_abi, _bytecode, signer);
  }

  deploy(
    _alPine: string,
    _goldnugget: string,
    overrides?: Overrides
  ): Promise<MoneySink> {
    return super.deploy(
      _alPine,
      _goldnugget,
      overrides || {}
    ) as Promise<MoneySink>;
  }
  getDeployTransaction(
    _alPine: string,
    _goldnugget: string,
    overrides?: Overrides
  ): TransactionRequest {
    return super.getDeployTransaction(_alPine, _goldnugget, overrides || {});
  }
  attach(address: string): MoneySink {
    return super.attach(address) as MoneySink;
  }
  connect(signer: Signer): MoneySink__factory {
    return super.connect(signer) as MoneySink__factory;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): MoneySink {
    return new Contract(address, _abi, signerOrProvider) as MoneySink;
  }
}

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_alPine",
        type: "address",
      },
      {
        internalType: "contract IERC20",
        name: "_goldnugget",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "alPine",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "exit",
    outputs: [
      {
        internalType: "int256",
        name: "amountAdded",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "harvest",
    outputs: [
      {
        internalType: "int256",
        name: "amountAdded",
        type: "int256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "lose",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "pendingOwner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "skim",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "goldnugget",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        internalType: "bool",
        name: "direct",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "renounce",
        type: "bool",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [
      {
        internalType: "uint256",
        name: "actualAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const _bytecode =
  "0x60c060405234801561001057600080fd5b50604051610b02380380610b028339818101604052604081101561003357600080fd5b508051602090910151600080546001600160a01b0319163390811782556040519091907f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0908290a36001600160601b0319606091821b811660805291901b1660a05260805160601c60a05160601c610a1c6100e66000398061049c528061066652806107dd52508061032652806103ac528061047a5280610539528061063552806106ec52806107bb5250610a1c6000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80636832a266116100715780636832a2661461016d5780636939aaf51461018a5780636b2ace87146101a75780637f8661a1146101af5780638da5cb5b146101cc578063e30c3978146101d4576100a9565b8063078dfbe7146100ae5780630a087903146100e657806318fccc761461010a5780632e1a7d4d146101485780634e71e0c814610165575b600080fd5b6100e4600480360360608110156100c457600080fd5b506001600160a01b038135169060208101351515906040013515156101dc565b005b6100ee610324565b604080516001600160a01b039092168252519081900360200190f35b6101366004803603604081101561012057600080fd5b50803590602001356001600160a01b0316610348565b60408051918252519081900360200190f35b6101366004803603602081101561015e57600080fd5b50356104c8565b6100e4610566565b6100e46004803603602081101561018357600080fd5b5035610628565b6100e4600480360360208110156101a057600080fd5b5035610661565b6100ee610664565b610136600480360360208110156101c557600080fd5b5035610688565b6100ee610808565b6100ee610817565b6000546001600160a01b0316331461023b576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b8115610303576001600160a01b0383161515806102555750805b61029e576040805162461bcd60e51b81526020600482015260156024820152744f776e61626c653a207a65726f206164647265737360581b604482015290519081900360640190fd5b600080546040516001600160a01b03808716939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b0385166001600160a01b03199182161790915560018054909116905561031f565b600180546001600160a01b0319166001600160a01b0385161790555b505050565b7f000000000000000000000000000000000000000000000000000000000000000081565b600080546001600160a01b031633146103a8576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166370a08231306040518263ffffffff1660e01b815260040180826001600160a01b0316815260200191505060206040518083038186803b15801561041757600080fd5b505afa15801561042b573d6000803e3d6000fd5b505050506040513d602081101561044157600080fd5b5051905083811015610461576104578482610826565b60000391506104c1565b61046b8185610826565b91506104c16001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000167f00000000000000000000000000000000000000000000000000000000000000008461087c565b5092915050565b600080546001600160a01b03163314610528576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b600054610562906001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000811691168461087c565b5090565b6001546001600160a01b03163381146105c6576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c657220213d2070656e64696e67206f776e6572604482015290519081900360640190fd5b600080546040516001600160a01b03808516939216917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e091a3600080546001600160a01b039092166001600160a01b0319928316179055600180549091169055565b6106616001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001661dead60901b8361087c565b50565b7f000000000000000000000000000000000000000000000000000000000000000081565b600080546001600160a01b031633146106e8576040805162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572604482015290519081900360640190fd5b60007f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166370a08231306040518263ffffffff1660e01b815260040180826001600160a01b0316815260200191505060206040518083038186803b15801561075757600080fd5b505afa15801561076b573d6000803e3d6000fd5b505050506040513d602081101561078157600080fd5b50519050828110156107a1576107978382610826565b60000391506107ae565b6107ab8184610826565b91505b6108026001600160a01b037f0000000000000000000000000000000000000000000000000000000000000000167f00000000000000000000000000000000000000000000000000000000000000008361087c565b50919050565b6000546001600160a01b031681565b6001546001600160a01b031681565b80820382811115610876576040805162461bcd60e51b8152602060048201526015602482015274426f72696e674d6174683a20556e646572666c6f7760581b604482015290519081900360640190fd5b92915050565b604080516001600160a01b038481166024830152604480830185905283518084039091018152606490920183526020820180516001600160e01b031663a9059cbb60e01b178152925182516000946060949389169392918291908083835b602083106108f95780518252601f1990920191602091820191016108da565b6001836020036101000a0380198251168184511680821785525050505050509050019150506000604051808303816000865af19150503d806000811461095b576040519150601f19603f3d011682016040523d82523d6000602084013e610960565b606091505b509150915081801561098e57508051158061098e575080806020019051602081101561098b57600080fd5b50515b6109df576040805162461bcd60e51b815260206004820152601c60248201527f426f72696e6745524332303a205472616e73666572206661696c656400000000604482015290519081900360640190fd5b505050505056fea26469706673582212200af83c1b43ae2c32e6849db6c10560384d5514c4fd09addf5edd36edc068bcad64736f6c634300060c0033";