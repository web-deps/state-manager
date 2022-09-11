import StateManager, { IStateOption } from '../state-manager/state-manager';
import type {
  IStateManager,
  IStateManagerOptions,
  IStateObserver
} from '../state-manager/state-manager';

interface IDataStateOption<TData> {
  name: string;
  matches: (data: TData) => boolean;
  observers?: Array<IDataStateObserver<TData>>;
}

interface IDataStateObserver<TData> {
  (dataStateManager: IDataStateManager<TData>): void | Promise<void>;
}

interface IDataStateObservers<TData> {
  [state: string]: Array<IDataStateObserver<TData>>;
}

interface IDataTester<TData> {
  (data: TData): boolean;
}

interface IDataTestItem<TData> {
  state: string;
  matches: IDataTester<TData>;
}

interface IDataUpdateHandler<TData> {
  (data: TData): void;
}

interface IDataStateManager<TData> {
  name: string;
  stateManager: IStateManager;
  current: string;
  readonly currentData: TData;
  readonly context?: string;
  readonly tests: Array<IDataTestItem<TData>>;
  observers: IDataStateObservers<TData>;
  createObservers: (
    states: Array<IDataStateOption<TData>>
  ) => IDataStateObservers<TData>;
  createStateManagerStates: (
    states: Array<IDataStateOption<TData>>
  ) => Array<IStateOption>;
  addObserver: (state: string, observer: IDataStateObserver<TData>) => void;
  removeObserver: (state: string, observer: IDataStateObserver<TData>) => void;
  notifyObservers: (stateManager: IStateManager) => void;
  update: (data: TData) => void;
  onUpdate?: IDataUpdateHandler<TData>;
}

interface IDataStateContextOptions<TData> {
  [name: string]: Array<IDataStateOption<TData>>;
}

interface IDataStateOptions<TData>
  extends Omit<IStateManagerOptions, 'states' | 'contexts'> {
  states?: Array<IDataStateOption<TData>>;
  contexts?: IDataStateContextOptions<TData>;
  initialData: TData;
  onUpdate?: IDataUpdateHandler<TData>;
}

class DataStateManager<TData> implements IDataStateManager<TData> {
  public stateManager: IStateManager;
  public currentData: TData;
  public readonly context?: string;
  public tests: Array<IDataTestItem<TData>> = [];
  observers: IDataStateObservers<TData> = {};
  public onUpdate?: IDataUpdateHandler<TData>;

  constructor(options: IDataStateOptions<TData>) {
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
    let stateManagerStates: IStateManagerOptions['states'];
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
    states: IDataStateOption<TData>[]
  ): IDataStateObservers<TData> {
    return states.reduce(
      (allObservers, { name, observers }) => ({
        ...allObservers,
        [name]: observers
      }),
      {}
    );
  }

  createStateManagerStates<TData>(states: Array<IDataStateOption<TData>>) {
    return states.map(({ name }) => ({
      name,
      observers: [this.notifyObservers.bind(this)]
    }));
  }

  update(data: TData) {
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

  addObserver(state: string, observer: IDataStateObserver<TData>) {
    const observers = this.observers[state];

    if (!observers) {
      throw new Error(
        `Failed to add observer. State ${state} is not registered.`
      );
    }

    observers.push(observer);
  }

  removeObserver(state: string, observer: IDataStateObserver<TData>) {
    const observers = this.observers[state];

    if (!observers) {
      throw new Error(
        `Failed to remove observer. State ${state} is nor registered.`
      );
    }

    const observerIndex = observers.indexOf(observer);
    if (observerIndex > -1) observers.splice(observerIndex, 1);
  }

  notifyObservers(stateManager: IStateManager) {
    const observers = this.observers[stateManager.current];

    if (observers) {
      for (const observer of observers) observer(this);
    }
  }
}

export default DataStateManager;
export type { IDataStateManager, IDataStateObserver, IDataStateOption };
