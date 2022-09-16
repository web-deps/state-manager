import StateManager, {
  StateEventInterface,
  StateOptionInterface
} from '../state-manager/state-manager';
import type {
  StateManagerInterface,
  StateManagerOptionsInterface,
  StateObserverInterface
} from '../state-manager/state-manager';

interface DataStateOptionInterface<DataType> {
  name: string;
  matches: (data: DataType) => boolean;
  observers?: Array<DataStateObserverInterface<DataType>>;
}

interface DataStateEventInterface<DataType> {
  name: string;
  dataStateManager: DataStateManagerInterface<DataType>;
  data: DataType;
}

interface DataStateObserverInterface<DataType> {
  (dataStateEvent: DataStateEventInterface<DataType>): void | Promise<void>;
}

interface DataStateObserversInterface<DataType> {
  [state: string]: Array<DataStateObserverInterface<DataType>>;
}

interface DataTesterInterface<DataType> {
  (data: DataType): boolean;
}

interface DataTestItemInterface<DataType> {
  state: string;
  matches: DataTesterInterface<DataType>;
}

interface DataUpdateHandlerInterface<DataType> {
  (data: DataType): void;
}

interface DataStateManagerInterface<DataType> {
  name: string;
  stateManager: StateManagerInterface;
  current: string;
  readonly currentData: DataType;
  readonly context?: string;
  readonly tests: Array<DataTestItemInterface<DataType>>;
  observers: DataStateObserversInterface<DataType>;
  createObservers: (
    states: Array<DataStateOptionInterface<DataType>>
  ) => DataStateObserversInterface<DataType>;
  createStateManagerStates: (
    states: Array<DataStateOptionInterface<DataType>>
  ) => Array<StateOptionInterface>;
  addObserver: (
    state: string,
    observer: DataStateObserverInterface<DataType>
  ) => void;
  removeObserver: (
    state: string,
    observer: DataStateObserverInterface<DataType>
  ) => void;
  notifyObservers: StateObserverInterface;
  update: (data: DataType) => void;
  onUpdate?: DataUpdateHandlerInterface<DataType>;
}

interface DataStateContextOptionsInterface<DataType> {
  [name: string]: Array<DataStateOptionInterface<DataType>>;
}

interface DataStateOptionsInterface<DataType>
  extends Omit<StateManagerOptionsInterface, 'states' | 'contexts'> {
  states?: Array<DataStateOptionInterface<DataType>>;
  contexts?: DataStateContextOptionsInterface<DataType>;
  initialData: DataType;
  onUpdate?: DataUpdateHandlerInterface<DataType>;
}

class DataStateEvent<DataType> implements DataStateEventInterface<DataType> {
  public readonly name: string;
  public readonly dataStateManager: DataStateManagerInterface<DataType>;
  public readonly data: DataType;

  constructor(
    name: string,
    dataStateManager: DataStateManagerInterface<DataType>,
    data: DataType
  ) {
    this.name = name;
    this.dataStateManager = dataStateManager;
    this.data = data;
  }
}

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
      name = 'DataStateManager',
      states,
      contexts,
      context,
      initialData,
      onUpdate,
      ...stateManagerOptions
    } = options;

    this.currentData = initialData;
    let stateManagerStates: StateManagerOptionsInterface['states'];
    if (onUpdate) this.onUpdate = onUpdate;

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

  createStateManagerStates<DataType>(
    states: Array<DataStateOptionInterface<DataType>>
  ) {
    return states.map(({ name }) => ({
      name,
      observers: [this.notifyObservers.bind(this)]
    }));
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

  notifyObservers(stateEvent: StateEventInterface) {
    const { name, stateManager } = stateEvent;
    const observers = this.observers[stateManager.current];

    if (observers) {
      for (const observer of observers) {
        observer(new DataStateEvent(name, this, this.currentData));
      }
    }
  }
}

export default DataStateManager;
export type {
  DataStateManagerInterface,
  DataStateObserverInterface,
  DataStateOptionInterface,
  DataStateEvent
};
