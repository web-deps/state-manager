import type { CollectionStateCombinationsInterface } from "./collection-state-manager.types";

const createCollection = (
  combinations: CollectionStateCombinationsInterface
): Set<string> => {
  return new Set(Object.values(combinations).flat());
};

export default createCollection;
