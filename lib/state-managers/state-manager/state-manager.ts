import { EventEmitter } from "@web-deps/event-manager";

import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from "@web-deps/event-manager";

import StateEvent from "./state-event/state-event";
import type { StateEventInterface } from "./state-event/state-event";
import AbstractStateManager from "./abstract-state-manager";
import suspenseHandler from "./suspense-handler";
import getEventNames from "./get-event-names";
import createStateTransitions from "./create-state-transitions";

import type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateTransitionsInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType
} from "./state-manager.types";

// Use more specific error types

class StateManager extends AbstractStateManager {
  readonly name: string;
  protected _current: string;
  protected readonly eventManager: AbstractEventEmitter<
    AbstractStateManager,
    unknown
  >;
  public previous: string | null = null;
  public history: Array<string> = [];
  public readonly context?: string;
  public readonly saveHistory: boolean;
  public readonly observers: EventObserversInterface = {};
  public readonly transitions: { [state: string]: StateTransitionsInterface };
  public onSuspense: SuspenseHandlerType = suspenseHandler;

  constructor(options: StateManagerOptionsInterface) {
    super();

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
      this.transitions = createStateTransitions(states);
    } else if (contexts) {
      if (context) {
        const states = contexts[context];

        if (states) {
          this.eventManager = this.createEventManager(states);
          this.transitions = createStateTransitions(states);
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
    if (!this.states.includes(state)) {
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

  get states() {
    return this.eventManager.events;
  }

  stateIsRegistered(state: string): boolean {
    return this.states.includes(state);
  }

  createEventManager(
    states: StateOptionInterface[]
  ): AbstractEventEmitter<AbstractStateManager, unknown> {
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
    }, new EventEmitter(this, getEventNames(states)));
  }

  createEventManagerObserver(
    stateObserver: StateObserverInterface
  ): EventObserverType {
    return ({ name }) => {
      stateObserver(new StateEvent<AbstractStateManager>(name, this));
    };
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
}

export { StateManager, StateEvent };

export type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  AbstractStateManager,
  StateTransitionsInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType,
  StateEventInterface
};
