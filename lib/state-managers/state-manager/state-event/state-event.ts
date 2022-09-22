import { EventEmitter, Event } from "@web-deps/event-manager";
import type { EventInterface } from "@web-deps/event-manager";

interface StateEventInterface<StateManagerInterface> {
  readonly name: string;
  readonly subject: StateManagerInterface;
  readonly event: EventInterface<StateManagerInterface, unknown>;
}

class StateEvent<StateManagerInterface>
  implements StateEventInterface<StateManagerInterface>
{
  readonly event: EventInterface<StateManagerInterface, unknown>;

  constructor(name: string, subject: StateManagerInterface) {
    this.event = new Event(name, subject);
  }

  get name() {
    return this.event.name;
  }

  get subject() {
    return this.event.subject;
  }
}

export default StateEvent;
export type { StateEventInterface };
