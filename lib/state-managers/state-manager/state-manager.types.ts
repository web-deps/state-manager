import type {
  AbstractEventEmitter,
  EventInterface,
  EventObserverType
} from "@web-deps/event-manager";
import type { StateEventInterface } from "./state-event/state-event";
import AbstractStateManager from "./abstract-state-manager";

interface StateTransitionsInterface {
  from?: {
    states: Array<string>;
    observers: Array<StateObserverInterface>;
  };
  to?: {
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
    stateManagerEvent: StateEventInterface<AbstractStateManager>
  ): void | Promise<void>;
}

interface StateObserversInterface {
  [state: string]: Array<StateObserverInterface>;
}

interface StateContextOptionsInterface {
  [name: string]: Array<StateOptionInterface>;
}

type SuspenseHandlerType = (
  stateEvent: StateEventInterface<AbstractStateManager>
) => void | never;

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
  onSuspense?: SuspenseHandlerType;
}

export type {
  StateOptionInterface,
  StateObserverInterface,
  StateObserversInterface,
  EventObserversInterface,
  StateContextOptionsInterface,
  StateManagerOptionsInterface,
  StateTransitionsInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType
};
