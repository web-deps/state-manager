import type {
  AbstractStateManager,
  StateOptionInterface,
  StateEventInterface,
  StateManagerOptionsInterface
} from "../state-manager/state-manager";

import type { CollectionStateEventInterface } from "./collection-state-event/collection-state-event";

interface CollectionStateTransitionsInterface {
  from?: {
    states: Array<string>;
    observers: Array<CollectionStateObserverInterface>;
  };
  to?: {
    states: Array<string>;
    observers: Array<CollectionStateObserverInterface>;
  };
}

interface CollectionStateObserverInterface {
  (
    collectionStateEvent: CollectionStateEventInterface<CollectionStateManagerInterface>
  ): void;
}

interface CollectionStateObserversInterface {
  [state: string]: Array<CollectionStateObserverInterface>;
}

interface CollectionStateCombinationsInterface {
  [state: string]: Array<string>;
}

interface CombinationMatcherInterface {
  (combination: Array<string>, target: Array<string>): boolean;
}

interface CollectionStateOptionInterface {
  name: string;
  combination: Array<string>;
  observers?: Array<CollectionStateObserverInterface>;
  transitions?: CollectionStateTransitionsInterface;
}

interface CollectionStateSuspenseHandlerInterface {
  (
    collectionStateEvent: CollectionStateEventInterface<CollectionStateManagerInterface>
  ): void | never;
}

interface CollectionStateContextOptionsInterface {
  [context: string]: Array<CollectionStateOptionInterface>;
}

interface CollectionStateOptionsInterface
  extends Omit<
    StateManagerOptionsInterface,
    "states" | "contexts" | "onSuspense"
  > {
  states?: Array<CollectionStateOptionInterface>;
  contexts?: CollectionStateContextOptionsInterface;
  ordered?: boolean;
  size?: number;
  onSuspense?: CollectionStateSuspenseHandlerInterface;
}

interface CollectionStateManagerInterface {
  readonly name: string;
  readonly stateManager: AbstractStateManager;
  readonly current: string;
  readonly currentCombination: Array<string>;
  readonly previous: string | null;
  readonly history: Array<string>;
  readonly context?: string;
  readonly ordered: boolean;
  readonly fixedSize: boolean;
  readonly size?: number;
  readonly observers: CollectionStateObserversInterface;
  readonly combinations: CollectionStateCombinationsInterface;
  readonly collection: Set<string>;
  readonly inSuspense: boolean;
  createStateManagerStates: (
    states: Array<CollectionStateOptionInterface>
  ) => Array<StateOptionInterface>;
  setCombination: (combination: Array<string>) => void;
  addObserver: (
    state: string,
    observer: CollectionStateObserverInterface
  ) => void;
  removeObserver: (
    state: string,
    observer: CollectionStateObserverInterface
  ) => void;
  notifyObservers: (
    stateEvent: StateEventInterface<AbstractStateManager>
  ) => void;
  matchesCombination: CombinationMatcherInterface;
  appendItem: (item: string) => void;
  prependItem: (item: string) => void;
  removeItem: (item: string) => void;
  replaceItem: (oldItem: string, newItem: string) => void;
  popItem: () => void;
  shiftItems: (item?: string) => void;
  unshiftItems: (item?: string) => void;
  onSuspense: CollectionStateSuspenseHandlerInterface;
}

export type {
  CollectionStateObserverInterface,
  CollectionStateObserversInterface,
  CollectionStateCombinationsInterface,
  CombinationMatcherInterface,
  CollectionStateOptionInterface,
  CollectionStateSuspenseHandlerInterface,
  CollectionStateManagerInterface,
  CollectionStateContextOptionsInterface,
  CollectionStateOptionsInterface,
  CollectionStateTransitionsInterface
};
