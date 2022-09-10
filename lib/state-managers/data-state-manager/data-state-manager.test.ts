import { describe, it, expect } from 'vitest';
import DataStateManager from './data-state-manager';

describe('DataStateManager class', () => {
  it('initializes DataStateManager with "states" option', () => {
    const volume = new DataStateManager<number>({
      initialState: 'low',
      initialData: 50,
      states: [
        {
          name: 'low',
          matches: (value: number) => value < 80
        },
        {
          name: 'high',
          matches: (value: number) => value >= 80
        }
      ]
    });

    expect(volume.current).toBe('low');
    expect(volume.currentData).toBe(50);
    volume.update(90);
    expect(volume.current).toBe('high');
    expect(volume.currentData).toBe(90);
  });
});
