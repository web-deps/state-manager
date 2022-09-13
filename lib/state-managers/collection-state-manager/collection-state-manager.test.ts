import { describe, it, expect } from 'vitest';
import CollectionStateManager from './collection-state-manager';
import type { ICollectionStateOption } from './collection-state-manager';

let textFormatStates = [
  { name: 'normal', combination: ['normal'] },
  {
    name: 'bold',
    combination: ['bold']
  },
  {
    name: 'italic',
    combination: ['italic']
  },
  {
    name: 'bold-italic',
    combination: ['bold', 'italic']
  }
];

describe('CollectionStateManager class initialization', () => {
  it('initializes CollectionStateManager with "states" option', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'normal',
      states: [...textFormatStates]
    });

    expect(textFormat.current).toBe('normal');
    expect(textFormat.currentCombination).toEqual(['normal']);
  });

  it('initializes CollectionStateManager with "contexts" option', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'underline',
      contexts: {
        'underline-unsupported': [...textFormatStates],
        'underline-supported': [
          ...textFormatStates,
          {
            name: 'underline',
            combination: ['underline']
          }
        ]
      },
      context: 'underline-supported'
    });

    expect(textFormat.current).toBe('underline');
    expect(textFormat.currentCombination).toEqual(['underline']);
    expect(textFormat.context).toBe('underline-supported');
  });
});

describe('CollectionStateManager collection manipulation', () => {
  it('replaces item in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'normal',
      states: [...textFormatStates]
    });

    textFormat.replaceItem('normal', 'bold');
    expect(textFormat.current).toBe('bold');
    expect(textFormat.currentCombination).toEqual(['bold']);
  });

  it('appends item in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'bold',
      states: [...textFormatStates]
    });

    textFormat.appendItem('italic');
    expect(textFormat.current).toBe('bold-italic');
    expect(textFormat.currentCombination).toEqual(['bold', 'italic']);
  });

  it('prepends item in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'bold',
      states: [...textFormatStates]
    });

    textFormat.prependItem('italic');
    expect(textFormat.current).toBe('bold-italic');
    expect(textFormat.currentCombination).toEqual(['italic', 'bold']);
  });

  it('shifts items in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'bold-italic',
      states: [...textFormatStates]
    });

    textFormat.shiftItems('italic');
    expect(textFormat.current).toBe('bold-italic');
    expect(textFormat.currentCombination).toEqual(['italic', 'bold']);
    textFormat.shiftItems();
    expect(textFormat.current).toBe('italic');
    expect(textFormat.currentCombination).toEqual(['italic']);
  });

  it('unshifts items in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'bold-italic',
      states: [...textFormatStates]
    });

    textFormat.unshiftItems('bold');
    expect(textFormat.current).toBe('bold-italic');
    expect(textFormat.currentCombination).toEqual(['italic', 'bold']);
    textFormat.unshiftItems();
    expect(textFormat.current).toBe('bold');
    expect(textFormat.currentCombination).toEqual(['bold']);
  });

  it('pops item in collection', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'bold-italic',
      states: [...textFormatStates]
    });

    textFormat.popItem();
    expect(textFormat.current).toBe('bold');
    expect(textFormat.currentCombination).toEqual(['bold']);
  });
});

describe('CollectionStateManager observers', () => {
  const observerFlags = { normal: false, bold: false };

  let textFormatStatesWithObservers: Array<ICollectionStateOption> =
    textFormatStates.map(({ name, combination }) => ({ name, combination }));

  let normalState = textFormatStatesWithObservers.find(
    ({ name }) => name == 'normal'
  ) as ICollectionStateOption;

  normalState.observers = [
    () => {
      observerFlags.normal = true;
    }
  ];

  let boldState = textFormatStatesWithObservers.find(
    ({ name }) => name == 'bold'
  ) as ICollectionStateOption;

  boldState.observers = [
    () => {
      observerFlags.bold = true;
    }
  ];

  it('observes state changes', () => {
    const textFormat = new CollectionStateManager({
      initialState: 'normal',
      states: textFormatStatesWithObservers
    });

    expect(observerFlags.normal).toBe(false);
    textFormat.replaceItem('normal', 'bold');
    expect(observerFlags.bold).toBe(true);
    textFormat.replaceItem('bold', 'normal');
    expect(observerFlags.normal).toBe(true);
  });
});

describe('CollectionStateManager suspense', () => {
  it('puts CollectionStateManager in suspense with empty collection', () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: 'normal',
      states: [...textFormatStates],
      ordered: true,
      onSuspense: (collectionStateManager, combination) => {
        suspenseCombination = combination;
      }
    });

    textFormat.popItem();
    expect(textFormat.current).toBe('normal');
    expect(textFormat.currentCombination).toEqual(['normal']);
    expect(suspenseCombination).toEqual([]);
  });

  it('puts CollectionStateManager in suspense with wrong combination of items', () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: 'normal',
      states: [...textFormatStates],
      onSuspense: (collectionStateManager, combination) => {
        suspenseCombination = combination;
      }
    });

    textFormat.appendItem('bold');
    expect(textFormat.current).toBe('normal');
    expect(textFormat.currentCombination).toEqual(['normal']);
    expect(suspenseCombination).toEqual(['normal', 'bold']);
  });

  it('puts CollectionStateManager in suspense with wrong order of items', () => {
    let suspenseCombination;

    const textFormat = new CollectionStateManager({
      initialState: 'italic',
      states: [...textFormatStates],
      ordered: true,
      onSuspense: (collectionStateManager, combination) => {
        suspenseCombination = combination;
      }
    });

    textFormat.appendItem('bold');
    expect(textFormat.current).toBe('italic');
    expect(textFormat.currentCombination).toEqual(['italic']);
    expect(suspenseCombination).toEqual(['italic', 'bold']);
  });
});
