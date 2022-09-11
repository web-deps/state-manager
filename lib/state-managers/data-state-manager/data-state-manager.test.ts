import { describe, it, expect } from 'vitest';
import DataStateManager from './data-state-manager';
import type {
  IDataStateObserver,
  IDataStateOption
} from './data-state-manager';

let volumeStates = [
  {
    name: 'low',
    matches: (value: number) => value < 80
  },
  {
    name: 'high',
    matches: (value: number) => value >= 80
  }
];

describe('DataStateManager class', () => {
  it('initializes DataStateManager with "states" option', () => {
    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: volumeStates
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
  });

  it('initializes DataStateManager with "contexts" option', () => {
    const volume = new DataStateManager<number>({
      initialState: 'recommended',
      initialData: 70,
      contexts: {
        recommend: [
          {
            name: 'recommended',
            matches: (volume: number) => volume == 70
          },
          ...volumeStates
        ],
        'no-recommend': volumeStates
      },
      context: 'recommend'
    });

    expect(volume.current).toBe('recommended');
    expect(volume.currentData).toBe(70);
    expect(volume.context).toBe('recommend');
  });
});

describe('DataStateManager data updates', () => {
  it('updates DataStateManager data from low to high', () => {
    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: volumeStates
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
    volume.update(90);
    expect(volume.current).toBe('high');
    expect(volume.currentData).toBe(90);
  });

  it('updates DataStateManager data from high to low', () => {
    const volume = new DataStateManager<number>({
      initialState: 'high',
      initialData: 80,
      states: volumeStates
    });

    expect(volume.current).toBe('high');
    expect(volume.currentData).toBe(80);
    volume.update(50);
    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
  });

  it('updates DataStateManager data within the same range', () => {
    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: volumeStates
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
    volume.update(40);
    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(40);
  });
});

describe('DataStateManager observers', () => {
  it('observes DataStateManager states with one observer per state', () => {
    let observerFlags = { low: false, high: false };
    let volumeStatesWithObservers = volumeStates.map<IDataStateOption<number>>(
      ({ name, matches }) => ({ name, matches })
    );

    const lowVolumeObserver: IDataStateObserver<number> = (
      dataStateManager
    ) => {
      observerFlags.low = true;
    };

    const highVolumeObserver: IDataStateObserver<number> = (
      dataStateManager
    ) => {
      observerFlags.high = true;
    };

    volumeStatesWithObservers[0].observers = [lowVolumeObserver];
    volumeStatesWithObservers[1].observers = [highVolumeObserver];

    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: volumeStatesWithObservers
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
    expect(observerFlags.low).toBe(false);
    volume.update(90);
    expect(observerFlags.high).toBe(true);
    volume.update(50);
    expect(observerFlags.low).toBe(true);
  });

  it('observes DataStateManager states with two observers on one of the states', () => {
    let observerFlags = { low: 0, high: 0 };
    let volumeStatesWithObservers = volumeStates.map<IDataStateOption<number>>(
      ({ name, matches }) => ({ name, matches })
    );

    const lowVolumeObserver: IDataStateObserver<number> = (
      dataStateManager
    ) => {
      observerFlags.low++;
    };

    const highVolumeObserver: IDataStateObserver<number> = (
      dataStateManager
    ) => {
      observerFlags.high++;
    };

    volumeStatesWithObservers[0].observers = [lowVolumeObserver];
    volumeStatesWithObservers[1].observers = [
      highVolumeObserver,
      highVolumeObserver
    ];

    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: volumeStatesWithObservers
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
    expect(observerFlags.low).toBe(0);
    volume.update(90);
    expect(observerFlags.high).toBe(2);
    volume.update(50);
    expect(observerFlags.low).toBe(1);
  });
});
