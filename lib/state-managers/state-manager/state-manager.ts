import { EventEmitter, Event } from 'eve-man';
import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from 'eve-man';

interface StateOptionInterface {
  name: string;
  observers?: Array<StateObserverInterface>;
}

interface StateEventInterface {
  readonly name: string;
  readonly stateManager: StateManagerInterface;
  readonly event: EventInterface<StateManagerInterface, unknown>;
}

interface StateObserverInterface {
  (stateManagerEvent: StateEventInterface): void | Promise<void>;
}

interface StateObserversInterface {
  [state: string]: Array<StateObserverInterface>;
}

interface StateContextOptionsInterface {
  [name: string]: Array<StateOptionInterface>;
}

interface StateManagerInterface {
  name: string;
  _current: string;
  current: string;
  readonly eventManager: AbstractEventEmitter<StateManagerInterface, unknown>;
  readonly previous: string | null;
  readonly history: Array<string>;
  readonly context?: string;
  readonly saveHistory: boolean;
  readonly events: Array<string>;
  readonly eventIsRegistered: (state: string) => boolean;
  createEventManager: (
    states: Array<StateOptionInterface>
  ) => AbstractEventEmitter<StateManagerInterface, unknown>;
  getEvents: (states: Array<StateOptionInterface>) => Array<string>;
  createEventManagerObserver: (
    stateObserver: StateObserverInterface
  ) => EventObserverType;
  createObservers: (
    states: Array<StateOptionInterface>
  ) => StateObserversInterface;
  addObserver: (state: string, observer: StateObserverInterface) => void;
  removeObserver: (state: string, observer: StateObserverInterface) => void;
}

interface StateManagerOptionsInterface {
  name?: string;
  states?: Array<StateOptionInterface>;
  initialState: string;
  contexts?: StateContextOptionsInterface;
  context?: string;
  saveHistory?: boolean;
}

class StateEvent implements StateEventInterface {
  readonly event: EventInterface<StateManagerInterface, unknown>;

  constructor(name: string, stateManager: StateManagerInterface) {
    this.event = new Event(name, stateManager);
  }

  get name() {
    return this.event.name;
  }

  get stateManager() {
    return this.event.subject;
  }
}

// Use more specific error types

class StateManager implements StateManagerInterface {
  readonly name: string;
  public _current: string;
  public readonly eventManager: AbstractEventEmitter<
    StateManagerInterface,
    unknown
  >;
  public readonly previous: string | null = null;
  public readonly history: Array<string> = [];
  public readonly context?: string;
  public readonly saveHistory: boolean;

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
      this.eventManager.emit(state);
    } catch (error) {
      this._current = currentState;

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
      if (observers) {
        for (const observer of observers) {
          eventManager.addObserver(
            name,
            this.createEventManagerObserver(observer)
          );
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

  createObservers(states: Array<StateOptionInterface>) {
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
      this.eventManager.addObserver(
        state,
        this.createEventManagerObserver(observer)
      );
    } catch (error) {
      throw new Error(`
        Failed to add observer. State ${state} is not registered.
      `);
    }
  }

  removeObserver(state: string, observer: StateObserverInterface) {
    try {
      this.eventManager.removeObserver(
        state,
        this.createEventManagerObserver(observer)
      );
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
  StateEvent
};
