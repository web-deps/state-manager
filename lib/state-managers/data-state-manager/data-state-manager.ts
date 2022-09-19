import { StateManager } from "../state-manager/state-manager";

import type {
  StateEventInterface,
  StateOptionInterface
} from "../state-manager/state-manager";

import type {
  StateManagerInterface,
  StateManagerOptionsInterface,
  StateObserverInterface
} from "../state-manager/state-manager";

import type {
  DataStateManagerInterface,
  DataStateOptionInterface,
  DataStateOptionsInterface,
  DataStateObserverInterface,
  DataStateObserversInterface,
  DataTesterInterface,
  DataTestItemInterface,
  DataUpdateHandlerInterface,
  DataStateContextOptionsInterface,
  DataStateSuspenseHandlerType
} from "./data-state-manager.types";

import DataStateEvent, {
  DataStateEventInterface
} from "./data-state-event/data-state-event";
import { StateTransitionsInterface } from "../state-manager/state-manager.types";

class DataStateManager<DataType>
  implements DataStateManagerInterface<DataType>
{
  public stateManager: StateManagerInterface;
  public currentData: DataType;
  public readonly context?: string;
  public tests: Array<DataTestItemInterface<DataType>> = [];
  observers: DataStateObserversInterface<DataType> = {};
  public onUpdate?: DataUpdateHandlerInterface<DataType>;

  constructor(options: DataStateOptionsInterface<DataType>) {
    let {
      name = "DataStateManager",
      states,
      contexts,
      context,
      initialData,
      onUpdate,
      onSuspense,
      ...stateManagerOptions
    } = options;

    this.currentData = initialData;
    let stateManagerStates: StateManagerOptionsInterface["states"];
    if (onUpdate) this.onUpdate = onUpdate;
    if (onSuspense) this.onSuspense = onSuspense;

    if (states) {
      stateManagerStates = this.createStateManagerStates(states);
      this.observers = this.createObservers(states);

      this.tests = states.map(({ name, matches }) => ({
        state: name,
        matches
      }));
    } else if (contexts) {
      if (!context) {
        throw new Error(`
          Failed to create ${name}. 
          You must provide context when using options.contexts.
        `);
      }

      if (!(context in contexts)) {
        throw new Error(`
          Failed to create ${name}. 
          Context ${context} was not found in options.contexts.
        `);
      }

      const states = contexts[context];

      if (!states) {
        throw new Error(`
          Failed to create ${this.name}. 
          States for context ${context} were not found in options.contexts.
        `);
      }

      this.context = context;
      this.observers = this.createObservers(states);
      stateManagerStates = this.createStateManagerStates(states);

      this.tests = states.map(({ name, matches }) => ({
        state: name,
        matches
      }));
    }

    this.stateManager = new StateManager({
      name,
      states: stateManagerStates,
      onSuspense: ({ name }) => {
        this.onSuspense(new DataStateEvent(name, this, this.currentData));
      },
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
    this.stateManager.current = state;
  }

  get previous() {
    return this.stateManager.previous;
  }

  get history() {
    return this.stateManager.history;
  }

  createObservers(
    states: DataStateOptionInterface<DataType>[]
  ): DataStateObserversInterface<DataType> {
    return states.reduce(
      (allObservers, { name, observers }) => ({
        ...allObservers,
        [name]: observers
      }),
      {}
    );
  }

  createStateManagerStates(states: Array<DataStateOptionInterface<DataType>>) {
    const convertTransitionObserver =
      (
        dataStateObserver: DataStateObserverInterface<DataType>
      ): StateObserverInterface =>
      (stateEvent: StateEventInterface<StateManagerInterface>) => {
        dataStateObserver(
          new DataStateEvent<DataStateManagerInterface<DataType>, DataType>(
            stateEvent.name,
            this,
            this.currentData
          )
        );
      };

    return states.map(({ name, transitions }) => {
      let stateTransitions: Required<StateTransitionsInterface> = {
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
        transitions: transitions && stateTransitions
      };
    });
  }

  update(data: DataType) {
    if (data == this.currentData) return;
    this.currentData = data;
    this.onUpdate && this.onUpdate(data);

    for (const { state, matches } of this.tests) {
      if (matches(data)) {
        if (state == this.current) return;
        this.current = state;
        break;
      }
    }
  }

  addObserver(state: string, observer: DataStateObserverInterface<DataType>) {
    const observers = this.observers[state];

    if (!observers) {
      throw new Error(
        `Failed to add observer. State ${state} is not registered.`
      );
    }

    observers.push(observer);
  }

  removeObserver(
    state: string,
    observer: DataStateObserverInterface<DataType>
  ) {
    const observers = this.observers[state];

    if (!observers) {
      throw new Error(
        `Failed to remove observer. State ${state} is nor registered.`
      );
    }

    const observerIndex = observers.indexOf(observer);
    if (observerIndex > -1) observers.splice(observerIndex, 1);
  }

  notifyObservers(stateEvent: StateEventInterface<StateManagerInterface>) {
    const { name, stateManager } = stateEvent;
    const observers = this.observers[stateManager.current];

    if (observers) {
      for (const observer of observers) {
        observer(new DataStateEvent(name, this, this.currentData));
      }
    }
  }

  onSuspense(
    dataStateEvent: DataStateEventInterface<
      DataStateManagerInterface<DataType>,
      DataType
    >
  ) {
    throw new Error(`
      Failed to transition state.
      Transition from ${this.current} to ${dataStateEvent.name} is not allowed.
    `);
  }
}

export { DataStateManager, DataStateEvent };

export type {
  DataStateManagerInterface,
  DataStateOptionInterface,
  DataStateOptionsInterface,
  DataStateObserverInterface,
  DataStateObserversInterface,
  DataTesterInterface,
  DataTestItemInterface,
  DataUpdateHandlerInterface,
  DataStateContextOptionsInterface,
  DataStateSuspenseHandlerType,
  DataStateEventInterface
};
