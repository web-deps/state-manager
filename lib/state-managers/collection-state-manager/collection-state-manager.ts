import StateManager, {
  StateObserverInterface
} from "../state-manager/state-manager";

import type {
  StateManagerInterface,
  StateOptionInterface,
  StateEventInterface
} from "../state-manager/state-manager";

import type {
  CollectionStateObserverInterface,
  CollectionStateObserversInterface,
  CollectionStateCombinationsInterface,
  CombinationMatcherInterface,
  CollectionStateOptionInterface,
  CollectionStateSuspenseHandlerInterface,
  CollectionStateManagerInterface,
  CollectionStateContextOptionsInterface,
  CollectionStateOptionsInterface
} from "./collection-state-manager.types";

import CollectionStateEvent from "./collection-state-event/collection-state-event";
import { StateTransitionsInterface } from "../state-manager/state-manager.types";

class CollectionStateManager {
  public stateManager: StateManagerInterface;
  currentCombination: Array<string> = [];
  observers: CollectionStateObserversInterface = {};
  public readonly context?: string;
  ordered = false;
  fixedSize = false;
  size?: number;
  combinations: CollectionStateCombinationsInterface = {};
  collection: Set<string> = new Set();
  inSuspense = false;

  constructor(options: CollectionStateOptionsInterface) {
    const {
      name = "CollectionStateManager",
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
    let stateManagerStates: Array<StateOptionInterface>;

    if (states) {
      stateManagerStates = this.createStateManagerStates(states);
      this.observers = this.createObservers(states);
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
      this.context = context;
      stateManagerStates = this.createStateManagerStates(states);
      this.observers = this.createObservers(states);
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

  get previous() {
    return this.stateManager.previous;
  }

  get history() {
    return this.stateManager.history;
  }

  createObservers(
    states: Array<CollectionStateOptionInterface>
  ): CollectionStateObserversInterface {
    return states.reduce(
      (allObservers, { name, observers }) => ({
        ...allObservers,
        [name]: observers
      }),
      {}
    );
  }

  createStateManagerStates(
    states: Array<CollectionStateOptionInterface>
  ): Array<StateOptionInterface> {
    const convertTransitionObserver =
      (
        collectionStateObserver: CollectionStateObserverInterface
      ): StateObserverInterface =>
      (stateEvent: StateEventInterface<StateManagerInterface>) => {
        collectionStateObserver(
          new CollectionStateEvent<CollectionStateManagerInterface>(
            stateEvent.name,
            this,
            this.currentCombination
          )
        );
      };

    return states.map(({ name, transitions }) => {
      let stateTransitions: StateTransitionsInterface = {
        from: {
          states: [],
          observers: []
        },
        to: {
          states: [],
          observers: []
        }
      };

      if (transitions) {
        if (transitions.from) {
          stateTransitions.from.states = transitions.from.states;
          stateTransitions.from.observers = transitions.from.observers.map(
            convertTransitionObserver
          );
        }

        if (transitions.to) {
          stateTransitions.to.states = transitions.to.states;
          stateTransitions.to.observers = transitions.to.observers.map(
            convertTransitionObserver
          );
        }
      }

      return {
        name,
        observers: [this.notifyObservers.bind(this)],
        transitions: stateTransitions
      };
    });
  }

  createCombinations(
    states: Array<CollectionStateOptionInterface>
  ): CollectionStateCombinationsInterface {
    return states.reduce(
      (combinations, { name, combination }) => ({
        [name]: combination,
        ...combinations
      }),
      {}
    );
  }

  createCollection(
    combinations: CollectionStateCombinationsInterface
  ): Set<string> {
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

  addObserver(state: string, observer: CollectionStateObserverInterface) {
    if (!(state in this.observers)) {
      throw new Error(`
        Failed to add observer on ${this.name}. 
        State ${state} is not registered.
      `);
    }

    this.observers[state].push(observer);
  }

  removeObserver(state: string, observer: CollectionStateObserverInterface) {
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

  notifyObservers(stateEvent: StateEventInterface<StateManagerInterface>) {
    const { name, stateManager } = stateEvent;
    const observers = this.observers[stateManager.current];

    if (observers) {
      for (const observer of observers)
        observer(new CollectionStateEvent(name, this, this.currentCombination));
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

    if (itemIndex > -1) {
      let items = [...this.currentCombination];
      items.splice(itemIndex, 1, newItem);
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
    collectionStateManager: CollectionStateManagerInterface,
    combination: Array<string>
  ) {
    throw new Error(`
      Failed to set combination on ${this.name}. 
      Combination [${combination.join(", ")}] does not match any state.
    `);
  }
}

export default CollectionStateManager;
export type {
  CollectionStateManagerInterface,
  CollectionStateOptionInterface,
  CollectionStateOptionsInterface
};
