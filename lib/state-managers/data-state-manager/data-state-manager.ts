import type { IStateManager } from '../state-manager/state-manager';

interface IDataStateManager<TData> extends IStateManager {
  readonly value: TData;
  readonly tests: Array<{
    state: string;
    matches: (value: TData) => boolean;
  }>;
  update: (value: TData) => void;
  onUpdate?: (value: TData) => void;
}

export type { IDataStateManager };
