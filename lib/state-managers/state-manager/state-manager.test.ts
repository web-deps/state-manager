import { describe, it, expect } from "vitest";
import StateManager, { StateManagerInterface } from "./state-manager";
import type { StateOptionInterface } from "./state-manager";

const colorStates = [
  { name: "red" },
  {
    name: "blue"
  }
];

describe("StateManager instantiation", () => {
  it('instantiates StateManager with "states" option', () => {
    const color = new StateManager({
      initialState: "red",
      states: [
        { name: "red" },
        {
          name: "blue"
        }
      ]
    });

    expect(color.current).toBe("red");
  });

  it('instantiates StateManager with "contexts" option', () => {
    const color = new StateManager({
      initialState: "gray",
      contexts: {
        normal: colorStates,
        extended: [...colorStates, { name: "gray" }]
      },
      context: "extended"
    });

    expect(color.current).toBe("gray");
  });
});

describe("StateManager state changes", () => {
  it("changes state from initial state to a new one", () => {
    const color = new StateManager({
      initialState: "red",
      states: [
        { name: "red" },
        {
          name: "blue"
        }
      ]
    });

    expect(color.current).toBe("red");
    color.current = "blue";
    expect(color.current).toBe("blue");
  });
});

describe("StateManager observers", () => {
  it("observes StateManager state changes", () => {
    let colorStatesWithObservers: Array<StateOptionInterface> = colorStates.map(
      ({ name }) => ({ name })
    );
    let observerFlags = {
      red: false,
      blue: false
    };

    const redObserver = () => {
      observerFlags.red = true;
    };
    const blueObserver = () => {
      observerFlags.blue = true;
    };
    const redState = colorStatesWithObservers.find(
      ({ name }) => name == "red"
    ) as StateOptionInterface;
    const blueState = colorStatesWithObservers.find(
      ({ name }) => name == "blue"
    ) as StateOptionInterface;
    redState.observers = [redObserver];
    blueState.observers = [blueObserver];

    const color = new StateManager({
      initialState: "red",
      states: colorStatesWithObservers
    });

    expect(observerFlags.red).toBe(false);
    color.current = "blue";
    expect(observerFlags.blue).toBe(true);
    color.current = "red";
    expect(observerFlags.red).toBe(true);
  });

  it("adds observers to StateManager", () => {
    let observerFlags = {
      red: false,
      blue: false
    };

    const redObserver = () => {
      observerFlags.red = true;
    };

    const blueObserver = () => {
      observerFlags.blue = true;
    };

    const color = new StateManager({
      initialState: "red",
      states: colorStates
    });

    expect(observerFlags.red).toBe(false);
    color.current = "blue";
    color.addObserver("red", redObserver);
    color.current = "red";
    expect(observerFlags.red).toBe(true);
  });

  it("removes observers from StateManager", () => {
    let observerFlags = {
      red: false,
      blue: false
    };

    const redObserver = () => {
      observerFlags.red = true;
    };

    const blueObserver = () => {
      observerFlags.blue = true;
    };

    const color = new StateManager({
      initialState: "red",
      states: colorStates
    });

    expect(observerFlags.red).toBe(false);
    color.current = "blue";
    color.addObserver("red", redObserver);
    color.current = "red";
    expect(observerFlags.red).toBe(true);
    color.current = "blue";
    color.removeObserver("red", redObserver);
    observerFlags.red = false;
    color.current = "red";
    expect(observerFlags.red).toBe(false);
  });
});

describe("StateManager history", () => {
  it("change and track StateManager previous value", () => {
    const color = new StateManager({
      initialState: "red",
      states: colorStates
    });

    expect(color.previous).toBe(null);
    color.current = "blue";
    expect(color.previous).toBe("red");
    color.current = "red";
    expect(color.previous).toBe("blue");
  });

  it("should not change StateManager history", () => {
    const color = new StateManager({
      initialState: "red",
      states: colorStates
    });

    expect(color.history).toEqual([]);
    color.current = "blue";
    expect(color.history).toEqual([]);
    color.current = "red";
    expect(color.history).toEqual([]);
  });

  it("should change and track StateManager history", () => {
    const color = new StateManager({
      initialState: "red",
      states: colorStates,
      saveHistory: true
    });

    expect(color.history).toEqual([]);
    color.current = "blue";
    expect(color.history).toEqual(["red"]);
    color.current = "red";
    expect(color.history).toEqual(["red", "blue"]);
  });
});

describe("StateManager transitions", () => {
  let transitionFlags = {
    from: "",
    to: ""
  };

  const colorStatesWithTransitions = colorStates.map(({ name }) => {
    const otherState = name == "red" ? "blue" : "red";

    return {
      name,
      transitions: {
        from: {
          states: [otherState],
          observers: [
            () => {
              transitionFlags.from = otherState;
            }
          ]
        },
        to: {
          states: [otherState],
          observers: [
            () => {
              transitionFlags.to = otherState;
            }
          ]
        }
      }
    };
  });

  it("should notify transition observers", () => {
    const color = new StateManager({
      initialState: "red",
      states: colorStatesWithTransitions
    });

    expect(transitionFlags).toEqual({ from: "", to: "" });
    color.current = "blue";
    expect(transitionFlags.to).toBe("blue");
    expect(transitionFlags.from).toBe("red");
    color.current = "red";
    expect(transitionFlags.to).toBe("red");
    expect(transitionFlags.from).toBe("blue");
  });
});

describe("StateManager suspense", () => {
  let transitionFlags = {
    from: "",
    to: ""
  };

  const colorStatesWithTransitions = colorStates.map(({ name }) => {
    const otherState = name == "red" ? "blue" : "red";

    return {
      name,
      transitions: {
        from: {
          states: [otherState],
          observers: [
            () => {
              transitionFlags.from = otherState;
            }
          ]
        }
      }
    };
  });

  it("should put StateManager in suspense", () => {
    let inSuspense = false;

    const color = new StateManager({
      initialState: "red",
      states: colorStatesWithTransitions,
      onSuspense: () => {
        inSuspense = true;
      }
    });

    expect(color.current).toBe("red");
    color.current = "blue";
    expect(color.current).toBe("red");
    expect(inSuspense).toBe(true);
  });
});
