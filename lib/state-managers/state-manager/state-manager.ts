interface StateOptionInterface {
  name: string;
  observers?: Array<StateObserverInterface>;
}

interface StateObserverInterface {
  (stateManager: StateManagerInterface): void | Promise<void>;
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
  readonly previous: string | null;
  readonly history: Array<string>;
  readonly observers: StateObserversInterface;
  readonly context?: string;
  readonly saveHistory: boolean;
  createObservers: (
    states: Array<StateOptionInterface>
  ) => StateObserversInterface;
  addObserver: (state: string, observer: StateObserverInterface) => void;
  removeObserver: (state: string, observer: StateObserverInterface) => void;
  notifyObservers: (state: string) => void;
}

interface StateManagerOptionsInterface {
  name?: string;
  states?: Array<StateOptionInterface>;
  initialState: string;
  contexts?: StateContextOptionsInterface;
  context?: string;
  saveHistory?: boolean;
}

// Use more specific error types

class StateManager implements StateManagerInterface {
  readonly name: string;
  public _current: string;
  public readonly previous: string | null = null;
  public readonly history: Array<string> = [];
  public readonly context?: string;
  public readonly saveHistory: boolean;
  public observers: StateObserversInterface = {};

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

    if (states) this.observers = this.createObservers(states);
    else if (contexts) {
      if (context) {
        const states = contexts[context];

        if (states) {
          this.observers = this.createObservers(states);
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
    if (!this.observers[state])
      throw new Error(`
      Failed to set state. State ${state} is not registered.
    `);

    this._current = state;
    this.notifyObservers(state);
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
    let observers = this.observers[state];

    if (!observers)
      throw new Error(`
      Failed to create add observer. State ${state} is not registered.
    `);

    observers.push(observer);
  }

  removeObserver(state: string, observer: StateObserverInterface) {
    const observers = this.observers[state];

    if (!observers)
      throw new Error(`
      Failed to remove observer. State ${state} is not registered.
    `);

    const index = observers.indexOf(observer);
    if (index > -1) observers.splice(index, 1);
  }

  notifyObservers(state: string) {
    const observers = this.observers[state];

    if (!observers)
      throw new Error(`
      Failed to notify observers. State ${state} is not registered.
    `);

    for (const observer of observers) observer(this);
  }
}

export default StateManager;
export type {
  StateManagerInterface,
  StateManagerOptionsInterface,
  StateObserversInterface,
  StateOptionInterface,
  StateContextOptionsInterface,
  StateObserverInterface
};
