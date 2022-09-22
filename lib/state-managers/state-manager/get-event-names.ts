import type { StateOptionInterface } from "./state-manager.types";

const getEventNames = (states: Array<StateOptionInterface>): Array<string> => {
  return states.map(({ name }) => name);
};

export default getEventNames;
