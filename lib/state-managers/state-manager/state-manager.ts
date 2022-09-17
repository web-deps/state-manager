import { EventEmitter } from 'eve-man';
import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from 'eve-man';
import StateEvent from './state-event/state-event';
import type { StateEventInterface } from './state-event/state-event';
import type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateManagerInterface
} from './state-manager.types';

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

  constructor(options: StateManagerOptionsInterface) {
    const {
      name = 'StateManager',
      states,
      initialState,
      contexts,
      context,
      saveHistory = false
    } = options;

    this.name = name;
    this._current = initialState;
    this.saveHistory = saveHistory;

    if (states) {
      this.eventManager = this.createEventManager(states);
    } else if (contexts) {
      if (context) {
        const states = contexts[context];

        if (states) {
          this.eventManager = this.createEventManager(states);
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
    const currentState = this._current;

    try {
      this._current = state;
      this.previous = currentState;
      if (this.saveHistory) this.history.push(currentState);
      this.eventManager.emit(state);
    } catch (error) {
      this._current = currentState;
      this.history.pop();

      throw new Error(`
        Failed to set state. State ${state} is not registered.
      `);
    }
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
    return ({ name, subject }) => {
      stateObserver(new StateEvent(name, subject));
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

export default StateManager;
export type {
  StateManagerInterface,
  StateManagerOptionsInterface,
  StateObserversInterface,
  StateOptionInterface,
  StateContextOptionsInterface,
  StateObserverInterface,
  StateEventInterface
};
