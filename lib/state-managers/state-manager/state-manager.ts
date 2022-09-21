import { EventEmitter } from "@web-deps/event-manager";

import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from "@web-deps/event-manager";

import StateEvent from "./state-event/state-event";
import type { StateEventInterface } from "./state-event/state-event";

import type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateManagerInterface,
  StateTransitionsInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType
} from "./state-manager.types";

// Use more specific error types

class StateManager implements StateManagerInterface {
  readonly name: string;
  public _current: string;
  public readonly eventManager: AbstractEventEmitter<
    StateManagerInterface,
    unknown
  >;
  public previous: string | null = null;
  public history: Array<string> = [];
  public readonly context?: string;
  public readonly saveHistory: boolean;
  public readonly observers: EventObserversInterface = {};
  public readonly transitions: { [state: string]: StateTransitionsInterface };

  constructor(options: StateManagerOptionsInterface) {
    const {
      name = "StateManager",
      states,
      initialState,
      contexts,
      context,
      saveHistory = false,
      onSuspense
    } = options;

    this.name = name;
    this._current = initialState;
    this.saveHistory = saveHistory;
    if (onSuspense) this.onSuspense = onSuspense;

    if (states) {
      this.eventManager = this.createEventManager(states);
      this.transitions = this.createStateTransitions(states);
    } else if (contexts) {
      if (context) {
        const states = contexts[context];

        if (states) {
          this.eventManager = this.createEventManager(states);
          this.transitions = this.createStateTransitions(states);
          this.context = context;
        } else throw new Error(`Context ${context} is not listed in contexts.`);
      } else
        throw new Error(`
        Failed to create ${this.name}. 
        You can't provide contexts without specifying context.
      `);
    } else
      throw new Error(`
      Failed to create ${this.name}. 
      Options must have option states or contexts.
    `);
  }

  get current() {
    return this._current;
  }

  set current(state: string) {
    if (!this.events.includes(state)) {
      throw new Error(`
        Failed to set state. State ${state} is not registered.
      `);
    }

    const currentState = this.current;
    const currentStateTransitions = this.transitions[this.current];

    if (currentStateTransitions) {
      const transitionAllowed =
        currentStateTransitions.to &&
        currentStateTransitions.to.states.includes(state);

      if (!transitionAllowed) {
        this.onSuspense(new StateEvent(state, this));
        return;
      }

      const onBeforeTransitionObservers =
        currentStateTransitions?.to?.observers;

      if (onBeforeTransitionObservers) {
        for (const observer of onBeforeTransitionObservers) {
          observer(new StateEvent(state, this));
        }
      }
    }

    this._current = state;
    this.previous = currentState;
    const newStateTransitions = this.transitions[state];

    if (
      newStateTransitions &&
      newStateTransitions.from &&
      newStateTransitions.from.states.includes(this.previous as string)
    ) {
      const onAfterTransitionObservers = newStateTransitions.from.observers;

      if (onAfterTransitionObservers) {
        for (const observer of onAfterTransitionObservers) {
          observer(new StateEvent(this.previous as string, this));
        }
      }
    }

    if (this.saveHistory) this.history.push(currentState);
    this.eventManager.emit(state);
  }

  get events() {
    return this.eventManager.events;
  }

  eventIsRegistered(state: string): boolean {
    return this.events.includes(state);
  }

  createEventManager(
    states: StateOptionInterface[]
  ): AbstractEventEmitter<StateManagerInterface, unknown> {
    return states.reduce((eventManager, { name, observers }) => {
      if (!this.observers[name])
        this.observers[name] = {
          eventObservers: [],
          stateObservers: []
        };

      if (observers) {
        for (const observer of observers) {
          const eventObserver = this.createEventManagerObserver(observer);
          this.observers[name].eventObservers.push(eventObserver);
          this.observers[name].stateObservers.push(observer);

          eventManager.addObserver(name, eventObserver);
        }
      }

      return eventManager;
    }, new EventEmitter(this, this.getEvents(states)));
  }

  getEvents(states: Array<StateOptionInterface>): Array<string> {
    return states.map(({ name }) => name);
  }

  createEventManagerObserver(
    stateObserver: StateObserverInterface
  ): EventObserverType {
    return ({ name }) => {
      stateObserver(new StateEvent<StateManagerInterface>(name, this));
    };
  }

  createEventObservers(states: Array<StateOptionInterface>) {
    if (states.length < 2)
      throw new Error(`
      Failed to create observers. You need to provide at least 2 states.
    `);

    return states.reduce((allObservers, { name, observers }) => {
      if (!Array.isArray(observers)) observers = [];

      return {
        ...allObservers,
        [name]: observers
      };
    }, {});
  }

  createStateTransitions(
    states: StateOptionInterface[]
  ): StateTransitionCollectionInterface {
    return states.reduce((allTransitions, { name, transitions }) => {
      return transitions
        ? { ...allTransitions, [name]: transitions }
        : allTransitions;
    }, {});
  }

  addObserver(state: string, observer: StateObserverInterface) {
    try {
      const eventObserver = this.createEventManagerObserver(observer);
      this.observers[state].eventObservers.push(eventObserver);
      this.observers[state].stateObservers.push(observer);
      this.eventManager.addObserver(state, eventObserver);
    } catch (error) {
      throw new Error(`
        Failed to add observer. State ${state} is not registered.
      `);
    }
  }

  removeObserver(state: string, observer: StateObserverInterface) {
    try {
      const { eventObservers, stateObservers } = this.observers[state];
      const observerIndex = stateObservers.indexOf(observer);
      this.eventManager.removeObserver(state, eventObservers[observerIndex]);
      stateObservers.splice(observerIndex, 1);
    } catch (error) {
      throw new Error(`
        Failed to remove observer. State ${state} is not registered.
      `);
    }
  }

  onSuspense(stateEvent: StateEventInterface<StateManagerInterface>) {
    throw new Error(`
      Failed to transition state. 
      Transition from ${this.current} to ${stateEvent.name} is not allowed.
    `);
  }
}

export { StateManager, StateEvent };

export type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateManagerInterface,
  StateTransitionsInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType,
  StateEventInterface
};
