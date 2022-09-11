import { describe, it, expect } from 'vitest';
import DataStateManager from './data-state-manager';

const volumeStates = [
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
