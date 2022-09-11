import StateManager, {
  IStateManagerOptions
} from '../state-manager/state-manager';
import type {
  IStateManager,
  IStateOption
} from '../state-manager/state-manager';

interface ICollectionStateObserver {
  (collectionStateManager: ICollectionStateManager): void;
}

interface ICollectionStateObservers {
  [state: string]: Array<ICollectionStateObserver>;
}

interface ICollectionStateCombinations {
  [state: string]: Array<string>;
}

interface ICombinationMatcher {
  (combination: Array<string>, target: Array<string>): boolean;
}

interface ICollectionStateOption {
  name: string;
  combination: Array<string>;
  observers?: Array<ICollectionStateObserver>;
}

interface ICollectionStateSuspenseHandler {
  (
    collectionStateManager: ICollectionStateManager,
    combination: Array<string>
  ): void | never;
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
  readonly combinations: ICollectionStateCombinations;
  readonly collection: Set<string>;
  readonly inSuspense: boolean;
  createStateManagerStates: (
    states: Array<ICollectionStateOption>
  ) => Array<IStateOption>;
  createCombinations: (
    states: Array<ICollectionStateOption>
  ) => ICollectionStateCombinations;
  createCollection: (combinations: ICollectionStateCombinations) => Set<string>;
  setCombination: (combination: Array<string>) => void;
  addObserver: (state: string, observer: ICollectionStateObserver) => void;
  removeObserver: (state: string, observer: ICollectionStateObserver) => void;
  notifyObservers: (stateManager: IStateManager) => void;
  matchesCombinationWithOrder: ICombinationMatcher;
  matchesCombinationWithoutOrder: ICombinationMatcher;
  matchesCombination: ICombinationMatcher;
  appendItem: (item: string) => void;
  prependItem: (item: string) => void;
  removeItem: (item: string) => void;
  replaceItem: (oldItem: string, newItem: string) => void;
  popItem: () => void;
  shiftItems: (item?: string) => void;
  unshiftItems: (item?: string) => void;
  onSuspense: ICollectionStateSuspenseHandler;
}

interface ICollectionStateContextOptions {
  [context: string]: Array<ICollectionStateOption>;
}

interface ICollectionStateOptions
  extends Omit<IStateManagerOptions, 'states' | 'contexts'> {
  states?: Array<ICollectionStateOption>;
  contexts?: ICollectionStateContextOptions;
  ordered?: boolean;
  size?: number;
  onSuspense?: ICollectionStateSuspenseHandler;
}

class CollectionStateManager {
  public stateManager: IStateManager;
  currentCombination: Array<string> = [];
  observers: ICollectionStateObservers = {};
  ordered = false;
  fixedSize = false;
  size?: number;
  combinations: ICollectionStateCombinations = {};
  collection: Set<string> = new Set();
  inSuspense = false;

  constructor(options: ICollectionStateOptions) {
    const {
      name = 'CollectionStateManager',
      states,
      contexts,
      context,
      initialState,
      ordered,
      size,
      onSuspense,
      ...stateManagerOptions
    } = options;

    if (ordered) this.ordered = ordered;
    if (size) this.size = size;
    if (onSuspense) this.onSuspense = onSuspense;
    let stateManagerStates: Array<IStateOption>;

    if (states) {
      stateManagerStates = this.createStateManagerStates(states);
      this.combinations = this.createCombinations(states);
    } else if (contexts) {
      if (!context) {
        throw new Error(`
          Failed to create ${name}. 
          You must provide context when you use options.contexts.
        `);
      }

      if (!(context in contexts)) {
        throw new Error(`
          Failed to create ${name}. 
          Context ${context} does not match any context in options.contexts. 
        `);
      }

      const states = contexts[context];
      stateManagerStates = this.createStateManagerStates(states);
      this.combinations = this.createCombinations(states);
    } else {
      throw new Error(`
        Failed to create ${name}. 
        You must provide states or contexts in options. 
      `);
    }

    this.collection = this.createCollection(this.combinations);
    this.currentCombination = this.combinations[initialState];

    this.stateManager = new StateManager({
      name,
      states: stateManagerStates,
      initialState,
      ...stateManagerOptions
    });
  }

  get name() {
    return this.stateManager.name;
  }

  get current() {
    return this.stateManager.current;
  }

  set current(state: string) {
    if (!(state in this.combinations)) {
      throw new Error(`
        Failed to set state. State ${state} is registered on ${this.name}.
      `);
    }

    this.currentCombination = this.combinations[state];
    this.inSuspense = false;
    this.stateManager.current = state;
  }

  createStateManagerStates(
    states: Array<ICollectionStateOption>
  ): Array<IStateOption> {
    return states.map(({ name }) => ({
      name,
      observers: [this.notifyObservers.bind(this)]
    }));
  }

  createCombinations(
    states: Array<ICollectionStateOption>
  ): ICollectionStateCombinations {
    return states.reduce(
      (combinations, { name, combination }) => ({
        [name]: combination,
        ...combinations
      }),
      {}
    );
  }

  createCollection(combinations: ICollectionStateCombinations): Set<string> {
    return new Set(Object.values(combinations).flat());
  }

  setCombination(combination: Array<string>) {
    let found: boolean = false;

    for (const [state, stateCombination] of Object.entries(this.combinations)) {
      if (this.matchesCombination(combination, stateCombination)) {
        this.currentCombination = combination;
        this.inSuspense = false;
        this.stateManager.current = state;
        found = true;
        break;
      }
    }

    if (!found) {
      this.inSuspense = true;
      this.onSuspense(this, combination);
    }
  }

  matchesCombination(
    combination: Array<string>,
    target: Array<string>
  ): boolean {
    if (combination.length !== target.length) return false;

    return this.ordered
      ? this.matchesCombinationWithOrder(combination, target)
      : this.matchesCombinationWithoutOrder(combination, target);
  }

  matchesCombinationWithOrder(
    combination: Array<string>,
    target: Array<string>
  ): boolean {
    return combination.every((value, index) => value == target[index]);
  }

  matchesCombinationWithoutOrder(
    combination: Array<string>,
    target: Array<string>
  ): boolean {
    return combination.reduce(
      (matches, value) => matches && target.includes(value),
      true
    );
  }

  addObserver(state: string, observer: ICollectionStateObserver) {
    if (!(state in this.observers)) {
      throw new Error(`
        Failed to add observer on ${this.name}. 
        State ${state} is not registered.
      `);
    }

    this.observers[state].push(observer);
  }

  removeObserver(state: string, observer: ICollectionStateObserver) {
    if (!(state in this.observers)) {
      throw new Error(`
        Failed to remove observer from ${this.name}. 
        State ${state} is not registered.  
      `);
    }

    let observers = this.observers[state];
    const index = observers.indexOf(observer);
    if (index > -1) observers.splice(index, 1);
  }

  notifyObservers(stateManager: IStateManager) {
    const observers = this.observers[this.stateManager.current];

    if (observers) {
      for (const observer of observers) observer(this);
    }
  }

  appendItem(item: string) {
    if (!this.collection.has(item)) {
      throw new Error(`
        Failed to append item to ${this.name}. 
        Item ${item} is not in the collection.
      `);
    }

    const items = [...this.currentCombination, item];
    this.setCombination(items);
  }

  prependItem(item: string) {
    if (!this.collection.has(item)) {
      throw new Error(`
        Failed to prepend item to ${this.name}. 
        Item ${item} is not in the collection.
      `);
    }

    const items = [item, ...this.currentCombination];
    this.setCombination(items);
  }

  removeItem(item: string) {
    if (!this.collection.has(item)) {
      throw new Error(`
        Failed to remove item from ${this.name}. 
        Item ${item} is not in the collection.
      `);
    }

    const items = this.currentCombination.filter(
      (currentItem) => currentItem != item
    );

    this.setCombination(items);
  }

  replaceItem(oldItem: string, newItem: string) {
    if (!this.collection.has(oldItem)) {
      throw new Error(`
        Failed to replace item in ${this.name}. 
        Old item ${oldItem} is not in the collection.
      `);
    }

    if (!this.collection.has(newItem)) {
      throw new Error(`
        Failed to prepend item to ${this.name}. 
        New item ${newItem} is not in the collection.
      `);
    }

    const itemIndex = this.currentCombination.indexOf(oldItem);
    console.log(itemIndex);

    if (itemIndex > -1) {
      console.log(this.currentCombination);
      let items = [...this.currentCombination];
      items.splice(itemIndex, 1, newItem);
      console.log(items);
      this.setCombination(items);
    }
  }

  popItem() {
    let items = [...this.currentCombination];
    items.pop();
    this.setCombination(items);
  }

  shiftItems(item?: string) {
    if (item) {
      if (!this.collection.has(item)) {
        throw new Error(`
          Failed to pop item from ${this.name}. 
          Item ${item} is not in the collection.
        `);
      }
    }

    const partialItems = this.currentCombination.slice(0, -1);
    const items = item ? [item, ...partialItems] : [...partialItems];
    this.setCombination(items);
  }

  unshiftItems(item?: string) {
    if (item) {
      if (!this.collection.has(item)) {
        throw new Error(`
          Failed to pop item from ${this.name}. 
          Item ${item} is not in the collection.
        `);
      }
    }

    const partialItems = this.currentCombination.slice(1);
    const items = item ? [...partialItems, item] : [...partialItems];
    this.setCombination(items);
  }

  onSuspense(
    collectionStateManager: ICollectionStateManager,
    combination: Array<string>
  ) {
    throw new Error(`
      Failed to set combination on ${this.name}. 
      Combination [${combination.join(', ')}] does not match any state.
    `);
  }
}

export default CollectionStateManager;
export type { ICollectionStateManager };
