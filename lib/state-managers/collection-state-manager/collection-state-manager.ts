import type {
  IStateManager,
  IStateOption
} from '../state-manager/state-manager';

interface ICollectionStateObserver {
  (collectionStateManager: ICollectionStateManager): void;
}

interface ICollectionStateObservers {
  [state: string]: ICollectionStateObserver;
}

interface ICollectionStateCombination {
  state: string;
  items: Array<string>;
}

interface ICombinationMatcher {
  (combination: Array<string>): boolean;
}

interface ICollectionStateOption {
  name: string;
  combination: Array<string>;
  observers: Array<ICollectionStateObserver>;
}

interface ICollectionStateManager {
  readonly name: string;
  readonly stateManager: IStateManager;
  readonly current: string;
  readonly currentCombination: Array<string>;
  readonly ordered: boolean;
  readonly fixedSize: boolean;
  readonly size?: number;
  readonly observers: ICollectionStateObservers;
  readonly combinations: Array<ICollectionStateCombination>;
  createStateManagerStates: (
    states: Array<ICollectionStateOption>
  ) => Array<IStateOption>;
  setState: (state: string) => void;
  setCombination: (combination: Array<string>) => void;
  addObserver: (state: string, observer: ICollectionStateObserver) => void;
  removeObserver: (state: string, observer: ICollectionStateObserver) => void;
  notifyObservers: (state: string) => void;
  matchesWithOrder: ICombinationMatcher;
  matchesWithoutOrder: ICombinationMatcher;
  matches: ICombinationMatcher;
  appendItem: (item: string) => void;
  prependItem: (item: string) => void;
  removeItem: (item: string) => void;
  replaceItem: (oldItem: string, newItem: string, inPlace?: boolean) => void;
  popItem: () => void;
  shiftItems: (item?: string) => void;
  unshiftItems: (item?: string) => void;
  onSuspense: (state: string, item: string) => void | never;
}

export type { ICollectionStateManager };
