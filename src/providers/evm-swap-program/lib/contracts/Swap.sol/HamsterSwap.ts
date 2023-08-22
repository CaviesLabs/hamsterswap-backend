/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export declare namespace Params {
  export type SwapItemParamsStruct = {
    id: string;
    contractAddress: AddressLike;
    amount: BigNumberish;
    tokenId: BigNumberish;
    itemType: BigNumberish;
  };

  export type SwapItemParamsStructOutput = [
    id: string,
    contractAddress: string,
    amount: bigint,
    tokenId: bigint,
    itemType: bigint
  ] & {
    id: string;
    contractAddress: string;
    amount: bigint;
    tokenId: bigint;
    itemType: bigint;
  };

  export type SwapOptionParamsStruct = {
    id: string;
    askingItems: Params.SwapItemParamsStruct[];
  };

  export type SwapOptionParamsStructOutput = [
    id: string,
    askingItems: Params.SwapItemParamsStructOutput[]
  ] & { id: string; askingItems: Params.SwapItemParamsStructOutput[] };
}

export declare namespace Entity {
  export type SwapItemStruct = {
    id: string;
    contractAddress: AddressLike;
    amount: BigNumberish;
    owner: AddressLike;
    tokenId: BigNumberish;
    status: BigNumberish;
    itemType: BigNumberish;
  };

  export type SwapItemStructOutput = [
    id: string,
    contractAddress: string,
    amount: bigint,
    owner: string,
    tokenId: bigint,
    status: bigint,
    itemType: bigint
  ] & {
    id: string;
    contractAddress: string;
    amount: bigint;
    owner: string;
    tokenId: bigint;
    status: bigint;
    itemType: bigint;
  };

  export type SwapOptionStruct = {
    id: string;
    askingItems: Entity.SwapItemStruct[];
  };

  export type SwapOptionStructOutput = [
    id: string,
    askingItems: Entity.SwapItemStructOutput[]
  ] & { id: string; askingItems: Entity.SwapItemStructOutput[] };
}

export interface HamsterSwapInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "cancelProposal"
      | "configure"
      | "createProposal"
      | "etherman"
      | "fulfillProposal"
      | "getProposalItemsAndOptions"
      | "initialize"
      | "maxAllowedItems"
      | "maxAllowedOptions"
      | "multicall"
      | "onERC721Received"
      | "owner"
      | "pause"
      | "paused"
      | "proposals"
      | "renounceOwnership"
      | "transferOwnership"
      | "uniqueStringRegistry"
      | "unpause"
      | "unwrapETH"
      | "whitelistedAddresses"
      | "wrapETH"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "ConfigurationChanged"
      | "Initialized"
      | "ItemDeposited"
      | "ItemRedeemed"
      | "ItemWithdrawn"
      | "OwnershipTransferred"
      | "Paused"
      | "ProposalCreated"
      | "ProposalRedeemed"
      | "ProposalWithdrawn"
      | "Unpaused"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "cancelProposal",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "configure",
    values: [
      BigNumberish,
      BigNumberish,
      AddressLike[],
      AddressLike[],
      AddressLike
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "createProposal",
    values: [
      string,
      AddressLike,
      Params.SwapItemParamsStruct[],
      Params.SwapOptionParamsStruct[],
      BigNumberish
    ]
  ): string;
  encodeFunctionData(functionFragment: "etherman", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "fulfillProposal",
    values: [string, string]
  ): string;
  encodeFunctionData(
    functionFragment: "getProposalItemsAndOptions",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxAllowedItems",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "maxAllowedOptions",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "multicall",
    values: [BytesLike[]]
  ): string;
  encodeFunctionData(
    functionFragment: "onERC721Received",
    values: [AddressLike, AddressLike, BigNumberish, BytesLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(functionFragment: "pause", values?: undefined): string;
  encodeFunctionData(functionFragment: "paused", values?: undefined): string;
  encodeFunctionData(functionFragment: "proposals", values: [string]): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "uniqueStringRegistry",
    values: [string]
  ): string;
  encodeFunctionData(functionFragment: "unpause", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "unwrapETH",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "whitelistedAddresses",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "wrapETH",
    values: [AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "cancelProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "configure", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "createProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "etherman", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "fulfillProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getProposalItemsAndOptions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "maxAllowedItems",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "maxAllowedOptions",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "multicall", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "onERC721Received",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "pause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "paused", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "proposals", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "uniqueStringRegistry",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "unpause", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "unwrapETH", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "whitelistedAddresses",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "wrapETH", data: BytesLike): Result;
}

export namespace ConfigurationChangedEvent {
  export type InputTuple = [
    actor: AddressLike,
    timestamp: BigNumberish,
    maxAllowedItems: BigNumberish,
    maxAllowedOptions: BigNumberish,
    whitelistedAddresses: AddressLike[],
    blacklistedAddresses: AddressLike[],
    ethermanAddress: AddressLike
  ];
  export type OutputTuple = [
    actor: string,
    timestamp: bigint,
    maxAllowedItems: bigint,
    maxAllowedOptions: bigint,
    whitelistedAddresses: string[],
    blacklistedAddresses: string[],
    ethermanAddress: string
  ];
  export interface OutputObject {
    actor: string;
    timestamp: bigint;
    maxAllowedItems: bigint;
    maxAllowedOptions: bigint;
    whitelistedAddresses: string[];
    blacklistedAddresses: string[];
    ethermanAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ItemDepositedEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    fromAddress: AddressLike,
    timestamp: BigNumberish,
    contractAddress: AddressLike,
    amount: BigNumberish,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    actor: string,
    fromAddress: string,
    timestamp: bigint,
    contractAddress: string,
    amount: bigint,
    tokenId: bigint
  ];
  export interface OutputObject {
    id: string;
    actor: string;
    fromAddress: string;
    timestamp: bigint;
    contractAddress: string;
    amount: bigint;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ItemRedeemedEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    fromAddress: AddressLike,
    toAddress: AddressLike,
    timestamp: BigNumberish,
    contractAddress: AddressLike,
    amount: BigNumberish,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    actor: string,
    fromAddress: string,
    toAddress: string,
    timestamp: bigint,
    contractAddress: string,
    amount: bigint,
    tokenId: bigint
  ];
  export interface OutputObject {
    id: string;
    actor: string;
    fromAddress: string;
    toAddress: string;
    timestamp: bigint;
    contractAddress: string;
    amount: bigint;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ItemWithdrawnEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    fromAddress: AddressLike,
    toAddress: AddressLike,
    timestamp: BigNumberish,
    contractAddress: AddressLike,
    amount: BigNumberish,
    tokenId: BigNumberish
  ];
  export type OutputTuple = [
    id: string,
    actor: string,
    fromAddress: string,
    toAddress: string,
    timestamp: bigint,
    contractAddress: string,
    amount: bigint,
    tokenId: bigint
  ];
  export interface OutputObject {
    id: string;
    actor: string;
    fromAddress: string;
    toAddress: string;
    timestamp: bigint;
    contractAddress: string;
    amount: bigint;
    tokenId: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace PausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProposalCreatedEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    timestamp: BigNumberish
  ];
  export type OutputTuple = [id: string, actor: string, timestamp: bigint];
  export interface OutputObject {
    id: string;
    actor: string;
    timestamp: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProposalRedeemedEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    timestamp: BigNumberish,
    optionId: string
  ];
  export type OutputTuple = [
    id: string,
    actor: string,
    timestamp: bigint,
    optionId: string
  ];
  export interface OutputObject {
    id: string;
    actor: string;
    timestamp: bigint;
    optionId: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace ProposalWithdrawnEvent {
  export type InputTuple = [
    id: string,
    actor: AddressLike,
    timestamp: BigNumberish
  ];
  export type OutputTuple = [id: string, actor: string, timestamp: bigint];
  export interface OutputObject {
    id: string;
    actor: string;
    timestamp: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace UnpausedEvent {
  export type InputTuple = [account: AddressLike];
  export type OutputTuple = [account: string];
  export interface OutputObject {
    account: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface HamsterSwap extends BaseContract {
  connect(runner?: ContractRunner | null): HamsterSwap;
  waitForDeployment(): Promise<this>;

  interface: HamsterSwapInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  cancelProposal: TypedContractMethod<
    [proposalId: string],
    [void],
    "nonpayable"
  >;

  configure: TypedContractMethod<
    [
      _maxAllowedItems: BigNumberish,
      _maxAllowedOptions: BigNumberish,
      _whitelistedItemAddresses: AddressLike[],
      _blackListedItemAddresses: AddressLike[],
      _ethermanAddress: AddressLike
    ],
    [void],
    "nonpayable"
  >;

  createProposal: TypedContractMethod<
    [
      id: string,
      owner: AddressLike,
      swapItemsData: Params.SwapItemParamsStruct[],
      swapOptionsData: Params.SwapOptionParamsStruct[],
      expiredAt: BigNumberish
    ],
    [void],
    "nonpayable"
  >;

  etherman: TypedContractMethod<[], [string], "view">;

  fulfillProposal: TypedContractMethod<
    [proposalId: string, optionId: string],
    [void],
    "nonpayable"
  >;

  getProposalItemsAndOptions: TypedContractMethod<
    [id: string],
    [[Entity.SwapItemStructOutput[], Entity.SwapOptionStructOutput[]]],
    "view"
  >;

  initialize: TypedContractMethod<[], [void], "nonpayable">;

  maxAllowedItems: TypedContractMethod<[], [bigint], "view">;

  maxAllowedOptions: TypedContractMethod<[], [bigint], "view">;

  multicall: TypedContractMethod<[data: BytesLike[]], [string[]], "nonpayable">;

  onERC721Received: TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "view"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  pause: TypedContractMethod<[], [void], "nonpayable">;

  paused: TypedContractMethod<[], [boolean], "view">;

  proposals: TypedContractMethod<
    [arg0: string],
    [
      [string, bigint, string, string, string, bigint] & {
        id: string;
        expiredAt: bigint;
        owner: string;
        fulfilledBy: string;
        fulfilledByOptionId: string;
        status: bigint;
      }
    ],
    "view"
  >;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  uniqueStringRegistry: TypedContractMethod<[arg0: string], [boolean], "view">;

  unpause: TypedContractMethod<[], [void], "nonpayable">;

  unwrapETH: TypedContractMethod<[actor: AddressLike], [void], "nonpayable">;

  whitelistedAddresses: TypedContractMethod<
    [arg0: AddressLike],
    [boolean],
    "view"
  >;

  wrapETH: TypedContractMethod<
    [actor: AddressLike, amount: BigNumberish],
    [void],
    "payable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "cancelProposal"
  ): TypedContractMethod<[proposalId: string], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "configure"
  ): TypedContractMethod<
    [
      _maxAllowedItems: BigNumberish,
      _maxAllowedOptions: BigNumberish,
      _whitelistedItemAddresses: AddressLike[],
      _blackListedItemAddresses: AddressLike[],
      _ethermanAddress: AddressLike
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "createProposal"
  ): TypedContractMethod<
    [
      id: string,
      owner: AddressLike,
      swapItemsData: Params.SwapItemParamsStruct[],
      swapOptionsData: Params.SwapOptionParamsStruct[],
      expiredAt: BigNumberish
    ],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "etherman"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "fulfillProposal"
  ): TypedContractMethod<
    [proposalId: string, optionId: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "getProposalItemsAndOptions"
  ): TypedContractMethod<
    [id: string],
    [[Entity.SwapItemStructOutput[], Entity.SwapOptionStructOutput[]]],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "maxAllowedItems"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "maxAllowedOptions"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "multicall"
  ): TypedContractMethod<[data: BytesLike[]], [string[]], "nonpayable">;
  getFunction(
    nameOrSignature: "onERC721Received"
  ): TypedContractMethod<
    [arg0: AddressLike, arg1: AddressLike, arg2: BigNumberish, arg3: BytesLike],
    [string],
    "view"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "pause"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "paused"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "proposals"
  ): TypedContractMethod<
    [arg0: string],
    [
      [string, bigint, string, string, string, bigint] & {
        id: string;
        expiredAt: bigint;
        owner: string;
        fulfilledBy: string;
        fulfilledByOptionId: string;
        status: bigint;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "uniqueStringRegistry"
  ): TypedContractMethod<[arg0: string], [boolean], "view">;
  getFunction(
    nameOrSignature: "unpause"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "unwrapETH"
  ): TypedContractMethod<[actor: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "whitelistedAddresses"
  ): TypedContractMethod<[arg0: AddressLike], [boolean], "view">;
  getFunction(
    nameOrSignature: "wrapETH"
  ): TypedContractMethod<
    [actor: AddressLike, amount: BigNumberish],
    [void],
    "payable"
  >;

  getEvent(
    key: "ConfigurationChanged"
  ): TypedContractEvent<
    ConfigurationChangedEvent.InputTuple,
    ConfigurationChangedEvent.OutputTuple,
    ConfigurationChangedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "ItemDeposited"
  ): TypedContractEvent<
    ItemDepositedEvent.InputTuple,
    ItemDepositedEvent.OutputTuple,
    ItemDepositedEvent.OutputObject
  >;
  getEvent(
    key: "ItemRedeemed"
  ): TypedContractEvent<
    ItemRedeemedEvent.InputTuple,
    ItemRedeemedEvent.OutputTuple,
    ItemRedeemedEvent.OutputObject
  >;
  getEvent(
    key: "ItemWithdrawn"
  ): TypedContractEvent<
    ItemWithdrawnEvent.InputTuple,
    ItemWithdrawnEvent.OutputTuple,
    ItemWithdrawnEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Paused"
  ): TypedContractEvent<
    PausedEvent.InputTuple,
    PausedEvent.OutputTuple,
    PausedEvent.OutputObject
  >;
  getEvent(
    key: "ProposalCreated"
  ): TypedContractEvent<
    ProposalCreatedEvent.InputTuple,
    ProposalCreatedEvent.OutputTuple,
    ProposalCreatedEvent.OutputObject
  >;
  getEvent(
    key: "ProposalRedeemed"
  ): TypedContractEvent<
    ProposalRedeemedEvent.InputTuple,
    ProposalRedeemedEvent.OutputTuple,
    ProposalRedeemedEvent.OutputObject
  >;
  getEvent(
    key: "ProposalWithdrawn"
  ): TypedContractEvent<
    ProposalWithdrawnEvent.InputTuple,
    ProposalWithdrawnEvent.OutputTuple,
    ProposalWithdrawnEvent.OutputObject
  >;
  getEvent(
    key: "Unpaused"
  ): TypedContractEvent<
    UnpausedEvent.InputTuple,
    UnpausedEvent.OutputTuple,
    UnpausedEvent.OutputObject
  >;

  filters: {
    "ConfigurationChanged(address,uint256,uint256,uint256,address[],address[],address)": TypedContractEvent<
      ConfigurationChangedEvent.InputTuple,
      ConfigurationChangedEvent.OutputTuple,
      ConfigurationChangedEvent.OutputObject
    >;
    ConfigurationChanged: TypedContractEvent<
      ConfigurationChangedEvent.InputTuple,
      ConfigurationChangedEvent.OutputTuple,
      ConfigurationChangedEvent.OutputObject
    >;

    "Initialized(uint8)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "ItemDeposited(string,address,address,uint256,address,uint256,uint256)": TypedContractEvent<
      ItemDepositedEvent.InputTuple,
      ItemDepositedEvent.OutputTuple,
      ItemDepositedEvent.OutputObject
    >;
    ItemDeposited: TypedContractEvent<
      ItemDepositedEvent.InputTuple,
      ItemDepositedEvent.OutputTuple,
      ItemDepositedEvent.OutputObject
    >;

    "ItemRedeemed(string,address,address,address,uint256,address,uint256,uint256)": TypedContractEvent<
      ItemRedeemedEvent.InputTuple,
      ItemRedeemedEvent.OutputTuple,
      ItemRedeemedEvent.OutputObject
    >;
    ItemRedeemed: TypedContractEvent<
      ItemRedeemedEvent.InputTuple,
      ItemRedeemedEvent.OutputTuple,
      ItemRedeemedEvent.OutputObject
    >;

    "ItemWithdrawn(string,address,address,address,uint256,address,uint256,uint256)": TypedContractEvent<
      ItemWithdrawnEvent.InputTuple,
      ItemWithdrawnEvent.OutputTuple,
      ItemWithdrawnEvent.OutputObject
    >;
    ItemWithdrawn: TypedContractEvent<
      ItemWithdrawnEvent.InputTuple,
      ItemWithdrawnEvent.OutputTuple,
      ItemWithdrawnEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "Paused(address)": TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;
    Paused: TypedContractEvent<
      PausedEvent.InputTuple,
      PausedEvent.OutputTuple,
      PausedEvent.OutputObject
    >;

    "ProposalCreated(string,address,uint256)": TypedContractEvent<
      ProposalCreatedEvent.InputTuple,
      ProposalCreatedEvent.OutputTuple,
      ProposalCreatedEvent.OutputObject
    >;
    ProposalCreated: TypedContractEvent<
      ProposalCreatedEvent.InputTuple,
      ProposalCreatedEvent.OutputTuple,
      ProposalCreatedEvent.OutputObject
    >;

    "ProposalRedeemed(string,address,uint256,string)": TypedContractEvent<
      ProposalRedeemedEvent.InputTuple,
      ProposalRedeemedEvent.OutputTuple,
      ProposalRedeemedEvent.OutputObject
    >;
    ProposalRedeemed: TypedContractEvent<
      ProposalRedeemedEvent.InputTuple,
      ProposalRedeemedEvent.OutputTuple,
      ProposalRedeemedEvent.OutputObject
    >;

    "ProposalWithdrawn(string,address,uint256)": TypedContractEvent<
      ProposalWithdrawnEvent.InputTuple,
      ProposalWithdrawnEvent.OutputTuple,
      ProposalWithdrawnEvent.OutputObject
    >;
    ProposalWithdrawn: TypedContractEvent<
      ProposalWithdrawnEvent.InputTuple,
      ProposalWithdrawnEvent.OutputTuple,
      ProposalWithdrawnEvent.OutputObject
    >;

    "Unpaused(address)": TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
    Unpaused: TypedContractEvent<
      UnpausedEvent.InputTuple,
      UnpausedEvent.OutputTuple,
      UnpausedEvent.OutputObject
    >;
  };
}