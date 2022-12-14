import { describe, it, expect } from "vitest";
import { CollectionStateManager } from "./collection-state-manager";
import type { CollectionStateOptionInterface } from "./collection-state-manager";

let textFormatStates = [
  { name: "normal", combination: ["normal"] },
  {
    name: "bold",
    combination: ["bold"]
  },
  {
    name: "italic",
    combination: ["italic"]
  },
  {
    name: "bold-italic",
    combination: ["bold", "italic"]
  }
];

describe("CollectionStateManager class initialization", () => {
  it('initializes CollectionStateManager with "states" option', () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: [...textFormatStates]
    });

    expect(textFormat.current).toBe("normal");
    expect(textFormat.currentCombination).toEqual(["normal"]);
  });

  it('initializes CollectionStateManager with "contexts" option', () => {
    const textFormat = new CollectionStateManager({
      initialState: "underline",
      contexts: {
        "underline-unsupported": [...textFormatStates],
        "underline-supported": [
          ...textFormatStates,
          {
            name: "underline",
            combination: ["underline"]
          }
        ]
      },
      context: "underline-supported"
    });

    expect(textFormat.current).toBe("underline");
    expect(textFormat.currentCombination).toEqual(["underline"]);
    expect(textFormat.context).toBe("underline-supported");
  });
});

describe("CollectionStateManager collection manipulation", () => {
  it("replaces item in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: [...textFormatStates]
    });

    textFormat.replaceItem("normal", "bold");
    expect(textFormat.current).toBe("bold");
    expect(textFormat.currentCombination).toEqual(["bold"]);
  });

  it("appends item in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "bold",
      states: [...textFormatStates]
    });

    textFormat.appendItem("italic");
    expect(textFormat.current).toBe("bold-italic");
    expect(textFormat.currentCombination).toEqual(["bold", "italic"]);
  });

  it("prepends item in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "bold",
      states: [...textFormatStates]
    });

    textFormat.prependItem("italic");
    expect(textFormat.current).toBe("bold-italic");
    expect(textFormat.currentCombination).toEqual(["italic", "bold"]);
  });

  it("shifts items in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "bold-italic",
      states: [...textFormatStates]
    });

    textFormat.shiftItems("italic");
    expect(textFormat.current).toBe("bold-italic");
    expect(textFormat.currentCombination).toEqual(["italic", "bold"]);
    textFormat.shiftItems();
    expect(textFormat.current).toBe("italic");
    expect(textFormat.currentCombination).toEqual(["italic"]);
  });

  it("unshifts items in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "bold-italic",
      states: [...textFormatStates]
    });

    textFormat.unshiftItems("bold");
    expect(textFormat.current).toBe("bold-italic");
    expect(textFormat.currentCombination).toEqual(["italic", "bold"]);
    textFormat.unshiftItems();
    expect(textFormat.current).toBe("bold");
    expect(textFormat.currentCombination).toEqual(["bold"]);
  });

  it("pops item in collection", () => {
    const textFormat = new CollectionStateManager({
      initialState: "bold-italic",
      states: [...textFormatStates]
    });

    textFormat.popItem();
    expect(textFormat.current).toBe("bold");
    expect(textFormat.currentCombination).toEqual(["bold"]);
  });
});

describe("CollectionStateManager observers", () => {
  const observerFlags = { normal: false, bold: false };

  let textFormatStatesWithObservers: Array<CollectionStateOptionInterface> =
    textFormatStates.map(({ name, combination }) => ({ name, combination }));

  let normalState = textFormatStatesWithObservers.find(
    ({ name }) => name == "normal"
  ) as CollectionStateOptionInterface;

  normalState.observers = [
    () => {
      observerFlags.normal = true;
    }
  ];

  let boldState = textFormatStatesWithObservers.find(
    ({ name }) => name == "bold"
  ) as CollectionStateOptionInterface;

  boldState.observers = [
    () => {
      observerFlags.bold = true;
    }
  ];

  it("observes state changes", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStatesWithObservers
    });

    expect(observerFlags.normal).toBe(false);
    textFormat.replaceItem("normal", "bold");
    expect(observerFlags.bold).toBe(true);
    textFormat.replaceItem("bold", "normal");
    expect(observerFlags.normal).toBe(true);
  });
});

describe("CollectionStateManager history", () => {
  it("change and track CollectionStateManager previous value", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStates
    });

    expect(textFormat.previous).toBe(null);
    textFormat.replaceItem("normal", "bold");
    expect(textFormat.previous).toBe("normal");
    textFormat.replaceItem("bold", "normal");
    expect(textFormat.previous).toBe("bold");
  });

  it("should not change CollectionStateManager history", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStates
    });

    expect(textFormat.history).toEqual([]);
    textFormat.replaceItem("normal", "bold");
    expect(textFormat.history).toEqual([]);
    textFormat.replaceItem("bold", "normal");
    expect(textFormat.history).toEqual([]);
  });

  it("should change and track CollectionStateManager history", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStates,
      saveHistory: true
    });

    expect(textFormat.history).toEqual([]);
    textFormat.replaceItem("normal", "bold");
    expect(textFormat.history).toEqual(["normal"]);
    textFormat.replaceItem("bold", "normal");
    expect(textFormat.history).toEqual(["normal", "bold"]);
  });
});

describe("CollectionStateManager transitions", () => {
  let transitionFlags = {
    from: "",
    to: ""
  };

  const textFormatStatesWithTransitions = textFormatStates.map(
    ({ name, combination }) => {
      const otherState = name == "normal" ? "bold" : "normal";

      return {
        name,
        combination,
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
    }
  );

  it("should notify transition observers", () => {
    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStatesWithTransitions
    });

    expect(transitionFlags).toEqual({ from: "", to: "" });
    textFormat.replaceItem("normal", "bold");
    expect(transitionFlags.to).toBe("bold");
    expect(transitionFlags.from).toBe("normal");
    textFormat.replaceItem("bold", "normal");
    expect(transitionFlags.to).toBe("normal");
    expect(transitionFlags.from).toBe("bold");
  });
});

describe("CollectionStateManager suspense", () => {
  it("puts CollectionStateManager in suspense with empty collection", () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: [...textFormatStates],
      ordered: true,
      onSuspense: ({ subject, combination }) => {
        suspenseCombination = combination;
      }
    });

    textFormat.popItem();
    expect(textFormat.current).toBe("normal");
    expect(textFormat.currentCombination).toEqual(["normal"]);
    expect(suspenseCombination).toEqual([]);
  });

  it("puts CollectionStateManager in suspense with wrong combination of items", () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: [...textFormatStates],
      onSuspense: ({ subject, combination }) => {
        suspenseCombination = combination;
      }
    });

    textFormat.appendItem("bold");
    expect(textFormat.current).toBe("normal");
    expect(textFormat.currentCombination).toEqual(["normal"]);
    expect(suspenseCombination).toEqual(["normal", "bold"]);
  });

  it("puts CollectionStateManager in suspense with wrong order of items", () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: "italic",
      states: [...textFormatStates],
      ordered: true,
      onSuspense: ({ subject, combination }) => {
        suspenseCombination = combination;
      }
    });

    textFormat.appendItem("bold");
    expect(textFormat.current).toBe("italic");
    expect(textFormat.currentCombination).toEqual(["italic"]);
    expect(suspenseCombination).toEqual(["italic", "bold"]);
  });

  it("should put CollectionStateManager in suspense with illegal state transition", () => {
    let transitionFlags = {
      from: "",
      to: ""
    };

    const textFormatStatesWithTransitions = textFormatStates.map(
      ({ name, combination }) => {
        const otherState = name == "normal" ? "bold" : "normal";

        return {
          name,
          combination,
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
      }
    );

    let inSuspense = false;

    const textFormat = new CollectionStateManager({
      initialState: "normal",
      states: textFormatStatesWithTransitions,
      onSuspense: () => {
        inSuspense = true;
      }
    });

    expect(textFormat.current).toBe("normal");
    textFormat.replaceItem("normal", "bold");
    expect(textFormat.current).toBe("normal");
    expect(inSuspense).toBe(true);
  });
});
