import type {
  CollectionStateOptionInterface,
  CollectionStateCombinationsInterface
} from "./collection-state-manager.types";

const createCombinations = (
  states: Array<CollectionStateOptionInterface>
): CollectionStateCombinationsInterface => {
  return states.reduce(
    (combinations, { name, combination }) => ({
      [name]: combination,
      ...combinations
    }),
    {}
  );
};

export default createCombinations;
