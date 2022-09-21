import type {
  AbstractEventEmitter,
  EventObserverType
} from "@web-deps/event-manager";

import type {
  EventObserversInterface,
  StateObserverInterface,
  StateOptionInterface,
  StateTransitionCollectionInterface,
  SuspenseHandlerType
} from "./state-manager.types";

abstract class AbstractStateManager {
  abstract name: string;
  protected abstract _current: string;
  abstract current: string;
  abstract readonly eventManager: AbstractEventEmitter<
    AbstractStateManager,
    unknown
  >;
  abstract previous: string | null;
  abstract history: Array<string>;
  abstract readonly context?: string;
  abstract readonly saveHistory: boolean;
  abstract observers: EventObserversInterface;
  abstract readonly transitions: StateTransitionCollectionInterface;
  abstract readonly events: Array<string>;
  abstract eventIsRegistered(state: string): boolean;
  abstract createEventManager(
    states: Array<StateOptionInterface>
  ): AbstractEventEmitter<AbstractStateManager, unknown>;
  abstract getEvents(states: Array<StateOptionInterface>): Array<string>;
  abstract createEventManagerObserver(
    stateObserver: StateObserverInterface
  ): EventObserverType;
  abstract createEventObservers(
    states: Array<StateOptionInterface>
  ): EventObserversInterface;
  abstract createStateTransitions(
    states: Array<StateOptionInterface>
  ): StateTransitionCollectionInterface;
  abstract addObserver(state: string, observer: StateObserverInterface): void;
  abstract removeObserver(
    state: string,
    observer: StateObserverInterface
  ): void;
  abstract onSuspense: SuspenseHandlerType & ThisType<AbstractStateManager>;
}

export default AbstractStateManager;
