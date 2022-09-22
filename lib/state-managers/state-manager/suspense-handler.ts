import type { SuspenseHandlerType } from "./state-manager.types";
import type { AbstractStateManager } from "./abstract-state-manager";
import type { StateEventInterface } from "./state-event/state-event";

const suspenseHandler: SuspenseHandlerType = function (
  stateEvent: StateEventInterface<AbstractStateManager>
) {
  throw new Error(`
    Failed to transition state. 
    Transition from ${stateEvent.stateManager.current} to ${stateEvent.name} is not allowed.
  `);
};

export default suspenseHandler;
