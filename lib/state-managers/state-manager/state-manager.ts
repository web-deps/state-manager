interface IStateObserver {
  (state: string): void | Promise<void>;
}

interface IStateManager {
  _current: string;
  current: string;
  readonly previous: string;
  readonly history: Array<string>;
  readonly observers: { [state: string]: Array<IStateObserver> };
  readonly context: string;
  readonly saveHistory: boolean;
  setState: (state: string) => (void | never);
  addObserver: (state: string, observer: IStateObserver) => void;
  removeObserver: (state: string, observer: IStateObserver) => void;
  notifyObservers: () => void;
}

export type { IStateManager };
