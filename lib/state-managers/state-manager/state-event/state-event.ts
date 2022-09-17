import { EventEmitter, Event } from 'eve-man';
import type { EventInterface } from 'eve-man';

interface StateEventInterface<StateManagerInterface> {
  readonly name: string;
  readonly stateManager: StateManagerInterface;
  readonly event: EventInterface<StateManagerInterface, unknown>;
}

class StateEvent<StateManagerInterface>
  implements StateEventInterface<StateManagerInterface>
{
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

export default StateEvent;
export type { StateEventInterface };
