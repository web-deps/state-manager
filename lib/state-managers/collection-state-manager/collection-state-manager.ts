import type { IStateManager } from '../state-manager/state-manager';

interface ICollectionStateManager extends IStateManager {
  readonly currentCombination: Array<string>;
  readonly ordered: boolean;
  readonly fixedSize: boolean;
  readonly size?: number;
  readonly combinations: Array<{
    state: string;
    combination: Array<string>;
  }>;
  matchesWithOrder: (combination: Array<string>) => boolean;
  matchesWithoutOrder: (combination: Array<string>) => boolean;
  matches: (combination: Array<string>) => boolean;
  appendItem: (item: string) => void;
  prependItem: (item: string) => void;
  removeItem: (item: string) => void;
  replaceItem: (oldItem: string, newItem: string, inPlace?: boolean) => void;
  popItem: () => void;
  shiftItems: (item?: string) => void;
  unshiftItems: (item?: string) => void;
  onSuspense: (state: string, item: string) => void | never;
}

export type { ICollectionStateManager };
