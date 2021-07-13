/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface AlpHelperInterface extends ethers.utils.Interface {
  functions: {
    "getPairs(address,address[])": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "getPairs",
    values: [string, string[]]
  ): string;

  decodeFunctionResult(functionFragment: "getPairs", data: BytesLike): Result;

  events: {};
}

export class AlpHelper extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  listeners<T, G>(
    eventFilter?: TypedEventFilter<T, G>
  ): Array<TypedListener<T, G>>;
  off<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  on<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  once<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  removeListener<T, G>(
    eventFilter: TypedEventFilter<T, G>,
    listener: TypedListener<T, G>
  ): this;
  removeAllListeners<T, G>(eventFilter: TypedEventFilter<T, G>): this;

  queryFilter<T, G>(
    event: TypedEventFilter<T, G>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<T & G>>>;

  interface: AlpHelperInterface;

  functions: {
    getPairs(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<
      [
        ([
          string,
          string,
          string,
          string,
          boolean,
          string,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber
        ] & {
          pair: string;
          oracle: string;
          alPine: string;
          masterContract: string;
          masterContractApproved: boolean;
          tokenAsset: string;
          tokenCollateral: string;
          latestExchangeRate: BigNumber;
          lastBlockAccrued: BigNumber;
          interestRate: BigNumber;
          totalCollateralShare: BigNumber;
          totalAssetAmount: BigNumber;
          totalBorrowAmount: BigNumber;
          totalAssetFraction: BigNumber;
          totalBorrowFraction: BigNumber;
          interestPerBlock: BigNumber;
          feesPendingAmount: BigNumber;
          userCollateralShare: BigNumber;
          userAssetFraction: BigNumber;
          userAssetAmount: BigNumber;
          userBorrowPart: BigNumber;
          userBorrowAmount: BigNumber;
          userAssetBalance: BigNumber;
          userCollateralBalance: BigNumber;
          userAssetAllowance: BigNumber;
          userCollateralAllowance: BigNumber;
          utilization: BigNumber;
        })[]
      ] & {
        info: ([
          string,
          string,
          string,
          string,
          boolean,
          string,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber
        ] & {
          pair: string;
          oracle: string;
          alPine: string;
          masterContract: string;
          masterContractApproved: boolean;
          tokenAsset: string;
          tokenCollateral: string;
          latestExchangeRate: BigNumber;
          lastBlockAccrued: BigNumber;
          interestRate: BigNumber;
          totalCollateralShare: BigNumber;
          totalAssetAmount: BigNumber;
          totalBorrowAmount: BigNumber;
          totalAssetFraction: BigNumber;
          totalBorrowFraction: BigNumber;
          interestPerBlock: BigNumber;
          feesPendingAmount: BigNumber;
          userCollateralShare: BigNumber;
          userAssetFraction: BigNumber;
          userAssetAmount: BigNumber;
          userBorrowPart: BigNumber;
          userBorrowAmount: BigNumber;
          userAssetBalance: BigNumber;
          userCollateralBalance: BigNumber;
          userAssetAllowance: BigNumber;
          userCollateralAllowance: BigNumber;
          utilization: BigNumber;
        })[];
      }
    >;

    "getPairs(address,address[])"(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<
      [
        ([
          string,
          string,
          string,
          string,
          boolean,
          string,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber
        ] & {
          pair: string;
          oracle: string;
          alPine: string;
          masterContract: string;
          masterContractApproved: boolean;
          tokenAsset: string;
          tokenCollateral: string;
          latestExchangeRate: BigNumber;
          lastBlockAccrued: BigNumber;
          interestRate: BigNumber;
          totalCollateralShare: BigNumber;
          totalAssetAmount: BigNumber;
          totalBorrowAmount: BigNumber;
          totalAssetFraction: BigNumber;
          totalBorrowFraction: BigNumber;
          interestPerBlock: BigNumber;
          feesPendingAmount: BigNumber;
          userCollateralShare: BigNumber;
          userAssetFraction: BigNumber;
          userAssetAmount: BigNumber;
          userBorrowPart: BigNumber;
          userBorrowAmount: BigNumber;
          userAssetBalance: BigNumber;
          userCollateralBalance: BigNumber;
          userAssetAllowance: BigNumber;
          userCollateralAllowance: BigNumber;
          utilization: BigNumber;
        })[]
      ] & {
        info: ([
          string,
          string,
          string,
          string,
          boolean,
          string,
          string,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber,
          BigNumber
        ] & {
          pair: string;
          oracle: string;
          alPine: string;
          masterContract: string;
          masterContractApproved: boolean;
          tokenAsset: string;
          tokenCollateral: string;
          latestExchangeRate: BigNumber;
          lastBlockAccrued: BigNumber;
          interestRate: BigNumber;
          totalCollateralShare: BigNumber;
          totalAssetAmount: BigNumber;
          totalBorrowAmount: BigNumber;
          totalAssetFraction: BigNumber;
          totalBorrowFraction: BigNumber;
          interestPerBlock: BigNumber;
          feesPendingAmount: BigNumber;
          userCollateralShare: BigNumber;
          userAssetFraction: BigNumber;
          userAssetAmount: BigNumber;
          userBorrowPart: BigNumber;
          userBorrowAmount: BigNumber;
          userAssetBalance: BigNumber;
          userCollateralBalance: BigNumber;
          userAssetAllowance: BigNumber;
          userCollateralAllowance: BigNumber;
          utilization: BigNumber;
        })[];
      }
    >;
  };

  getPairs(
    user: string,
    pairs: string[],
    overrides?: CallOverrides
  ): Promise<
    ([
      string,
      string,
      string,
      string,
      boolean,
      string,
      string,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber
    ] & {
      pair: string;
      oracle: string;
      alPine: string;
      masterContract: string;
      masterContractApproved: boolean;
      tokenAsset: string;
      tokenCollateral: string;
      latestExchangeRate: BigNumber;
      lastBlockAccrued: BigNumber;
      interestRate: BigNumber;
      totalCollateralShare: BigNumber;
      totalAssetAmount: BigNumber;
      totalBorrowAmount: BigNumber;
      totalAssetFraction: BigNumber;
      totalBorrowFraction: BigNumber;
      interestPerBlock: BigNumber;
      feesPendingAmount: BigNumber;
      userCollateralShare: BigNumber;
      userAssetFraction: BigNumber;
      userAssetAmount: BigNumber;
      userBorrowPart: BigNumber;
      userBorrowAmount: BigNumber;
      userAssetBalance: BigNumber;
      userCollateralBalance: BigNumber;
      userAssetAllowance: BigNumber;
      userCollateralAllowance: BigNumber;
      utilization: BigNumber;
    })[]
  >;

  "getPairs(address,address[])"(
    user: string,
    pairs: string[],
    overrides?: CallOverrides
  ): Promise<
    ([
      string,
      string,
      string,
      string,
      boolean,
      string,
      string,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber,
      BigNumber
    ] & {
      pair: string;
      oracle: string;
      alPine: string;
      masterContract: string;
      masterContractApproved: boolean;
      tokenAsset: string;
      tokenCollateral: string;
      latestExchangeRate: BigNumber;
      lastBlockAccrued: BigNumber;
      interestRate: BigNumber;
      totalCollateralShare: BigNumber;
      totalAssetAmount: BigNumber;
      totalBorrowAmount: BigNumber;
      totalAssetFraction: BigNumber;
      totalBorrowFraction: BigNumber;
      interestPerBlock: BigNumber;
      feesPendingAmount: BigNumber;
      userCollateralShare: BigNumber;
      userAssetFraction: BigNumber;
      userAssetAmount: BigNumber;
      userBorrowPart: BigNumber;
      userBorrowAmount: BigNumber;
      userAssetBalance: BigNumber;
      userCollateralBalance: BigNumber;
      userAssetAllowance: BigNumber;
      userCollateralAllowance: BigNumber;
      utilization: BigNumber;
    })[]
  >;

  callStatic: {
    getPairs(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<
      ([
        string,
        string,
        string,
        string,
        boolean,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        pair: string;
        oracle: string;
        alPine: string;
        masterContract: string;
        masterContractApproved: boolean;
        tokenAsset: string;
        tokenCollateral: string;
        latestExchangeRate: BigNumber;
        lastBlockAccrued: BigNumber;
        interestRate: BigNumber;
        totalCollateralShare: BigNumber;
        totalAssetAmount: BigNumber;
        totalBorrowAmount: BigNumber;
        totalAssetFraction: BigNumber;
        totalBorrowFraction: BigNumber;
        interestPerBlock: BigNumber;
        feesPendingAmount: BigNumber;
        userCollateralShare: BigNumber;
        userAssetFraction: BigNumber;
        userAssetAmount: BigNumber;
        userBorrowPart: BigNumber;
        userBorrowAmount: BigNumber;
        userAssetBalance: BigNumber;
        userCollateralBalance: BigNumber;
        userAssetAllowance: BigNumber;
        userCollateralAllowance: BigNumber;
        utilization: BigNumber;
      })[]
    >;

    "getPairs(address,address[])"(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<
      ([
        string,
        string,
        string,
        string,
        boolean,
        string,
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber
      ] & {
        pair: string;
        oracle: string;
        alPine: string;
        masterContract: string;
        masterContractApproved: boolean;
        tokenAsset: string;
        tokenCollateral: string;
        latestExchangeRate: BigNumber;
        lastBlockAccrued: BigNumber;
        interestRate: BigNumber;
        totalCollateralShare: BigNumber;
        totalAssetAmount: BigNumber;
        totalBorrowAmount: BigNumber;
        totalAssetFraction: BigNumber;
        totalBorrowFraction: BigNumber;
        interestPerBlock: BigNumber;
        feesPendingAmount: BigNumber;
        userCollateralShare: BigNumber;
        userAssetFraction: BigNumber;
        userAssetAmount: BigNumber;
        userBorrowPart: BigNumber;
        userBorrowAmount: BigNumber;
        userAssetBalance: BigNumber;
        userCollateralBalance: BigNumber;
        userAssetAllowance: BigNumber;
        userCollateralAllowance: BigNumber;
        utilization: BigNumber;
      })[]
    >;
  };

  filters: {};

  estimateGas: {
    getPairs(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getPairs(address,address[])"(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    getPairs(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getPairs(address,address[])"(
      user: string,
      pairs: string[],
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}
