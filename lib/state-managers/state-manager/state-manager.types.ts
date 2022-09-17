import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from "eve-man";
import type { StateEventInterface } from "./state-event/state-event";

interface StateTransitionsInterface {
  from: {
    states: Array<string>;
    observers: Array<StateObserverInterface>;
  };
  to: {
    states: Array<string>;
    observers: Array<StateObserverInterface>;
  };
}

interface StateTransitionCollectionInterface {
  [state: string]: StateTransitionsInterface;
}

interface StateOptionInterface {
  name: string;
  observers?: Array<StateObserverInterface>;
  transitions?: StateTransitionsInterface;
}

interface StateObserverInterface {
  (
    stateManagerEvent: StateEventInterface<StateManagerInterface>
  ): void | Promise<void>;
}

interface StateObserversInterface {
  [state: string]: Array<StateObserverInterface>;
}

interface StateContextOptionsInterface {
  [name: string]: Array<StateOptionInterface>;
}

interface EventObserversInterface {
  [event: string]: {
    eventObservers: Array<EventObserverType>;
    stateObservers: Array<StateObserverInterface>;
  };
}

interface StateManagerOptionsInterface {
  name?: string;
  states?: Array<StateOptionInterface>;
  initialState: string;
  contexts?: StateContextOptionsInterface;
  context?: string;
  saveHistory?: boolean;
}

interface StateManagerInterface {
  name: string;
  _current: string;
  current: string;
  readonly eventManager: AbstractEventEmitter<StateManagerInterface, unknown>;
  previous: string | null;
  history: Array<string>;
  readonly context?: string;
  readonly saveHistory: boolean;
  readonly events: Array<string>;
  readonly eventIsRegistered: (state: string) => boolean;
  readonly observers: EventObserversInterface;
  readonly transitions: StateTransitionCollectionInterface;
  createEventManager: (
    states: Array<StateOptionInterface>
  ) => AbstractEventEmitter<StateManagerInterface, unknown>;
  getEvents: (states: Array<StateOptionInterface>) => Array<string>;
  createEventManagerObserver: (
    stateObserver: StateObserverInterface
  ) => EventObserverType;
  createEventObservers: (
    states: Array<StateOptionInterface>
  ) => EventObserversInterface;
  createStateTransitions: (
    states: Array<StateOptionInterface>
  ) => StateTransitionCollectionInterface;
  addObserver: (state: string, observer: StateObserverInterface) => void;
  removeObserver: (state: string, observer: StateObserverInterface) => void;
}

export type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateManagerInterface,
  StateTransitionsInterface,
  StateTransitionCollectionInterface
};
