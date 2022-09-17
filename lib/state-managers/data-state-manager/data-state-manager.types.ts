import type {
  StateManagerInterface,
  StateOptionInterface,
  StateManagerOptionsInterface,
  StateObserverInterface
} from '../state-manager/state-manager';

import type { DataStateEventInterface } from './data-state-event/data-state-event';

interface DataStateOptionInterface<DataType> {
  name: string;
  matches: (data: DataType) => boolean;
  observers?: Array<DataStateObserverInterface<DataType>>;
}

interface DataStateObserverInterface<DataType> {
  (
    dataStateEvent: DataStateEventInterface<
      DataStateManagerInterface<DataType>,
      DataType
    >
  ): void | Promise<void>;
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

export type {
  DataStateManagerInterface,
  DataStateOptionInterface,
  DataStateOptionsInterface,
  DataStateObserverInterface,
  DataStateObserversInterface,
  DataTesterInterface,
  DataTestItemInterface,
  DataUpdateHandlerInterface,
  DataStateContextOptionsInterface
};
