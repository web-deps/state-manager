import type {
  CollectionStateOptionInterface,
  CollectionStateObserversInterface
} from "./collection-state-manager.types";

const createObservers = (
  states: Array<CollectionStateOptionInterface>
): CollectionStateObserversInterface => {
  return states.reduce(
    (allObservers, { name, observers }) => ({
      ...allObservers,
      [name]: observers
    }),
    {}
  );
};

export default createObservers;
