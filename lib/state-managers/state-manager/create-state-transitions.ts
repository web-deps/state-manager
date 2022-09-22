import type {
  StateOptionInterface,
  StateTransitionCollectionInterface
} from "./state-manager.types";

const createStateTransitions = (
  states: Array<StateOptionInterface>
): StateTransitionCollectionInterface => {
  return states.reduce((allTransitions, { name, transitions }) => {
    return transitions
      ? { ...allTransitions, [name]: transitions }
      : allTransitions;
  }, {});
};

export default createStateTransitions;
