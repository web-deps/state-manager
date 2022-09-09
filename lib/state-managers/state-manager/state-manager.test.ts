import { describe, it, expect } from 'vitest';
import StateManager from './state-manager';

describe('StateManager class', () => {
  it('initializes StateManager with "states" option', () => {
    const color = new StateManager({
      initialState: 'red',
      states: [
        { name: 'red' },
        {
          name: 'blue'
        }
      ]
    });

    expect(color.current).toBe('red');
  });

  it('sets StateManager with initial state "red" and then to "blue"', () => {
    let currentColor = 'red';

    const color = new StateManager({
      initialState: currentColor,
      states: [
        { name: 'red' },
        {
          name: 'blue',
          observers: [
            (color) => {
              currentColor = color.current;
            }
          ]
        }
      ]
    });

    expect(color.current).toBe('red');
    color.current = 'blue';
    expect(color.current).toBe('blue');
    expect(currentColor).toBe('blue');
    color.current = 'red';
    expect(color.current).toBe('red');
    expect(currentColor).toBe('blue');
  });
});
