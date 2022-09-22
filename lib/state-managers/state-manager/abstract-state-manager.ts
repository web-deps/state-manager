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
  abstract readonly name: string;
  protected abstract _current: string;
  abstract current: string;
  protected abstract eventManager: AbstractEventEmitter<
    AbstractStateManager,
    unknown
  >;
  abstract previous: string | null;
  abstract history: Array<string>;
  abstract readonly context?: string;
  abstract readonly saveHistory: boolean;
  abstract observers: EventObserversInterface;
  abstract readonly transitions: StateTransitionCollectionInterface;
  abstract readonly states: Array<string>;
  abstract stateIsRegistered(state: string): boolean;
  abstract createEventManager(
    states: Array<StateOptionInterface>
  ): AbstractEventEmitter<AbstractStateManager, unknown>;
  abstract createEventManagerObserver(
    stateObserver: StateObserverInterface
  ): EventObserverType;
  abstract addObserver(state: string, observer: StateObserverInterface): void;
  abstract removeObserver(
    state: string,
    observer: StateObserverInterface
  ): void;
  abstract onSuspense: SuspenseHandlerType;
}

export default AbstractStateManager;
export type { AbstractStateManager };
