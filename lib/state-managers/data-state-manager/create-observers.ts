import type {
  DataStateObserversInterface,
  DataStateOptionInterface
} from "./data-state-manager.types";

const createObservers = <DataType>(
  states: DataStateOptionInterface<DataType>[]
): DataStateObserversInterface<DataType> => {
  return states.reduce(
    (allObservers, { name, observers }) => ({
      ...allObservers,
      [name]: observers
    }),
    {}
  );
};

export default createObservers;
