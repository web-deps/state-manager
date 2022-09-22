# StateEvent

An event fired before and after a state transition. It is passed as the only parameter to state observers.

## Constructor

### Signature

```js
constructor(name, stateManager);
```

### Params

- `name`:
  - Type: `string`
  - Description: The name of the state.
- `stateManager`:
  - Type: `StateManager`
  - Description: The state manager emitting the event.

## Properties

- `name`:
  - Type: `string`
  - Description: The name of the state.
- `subject`:
  - Type: `StateManager`
  - Description: The state manager emitting the event.
- `event`:
  - Type: `object`
  - The event being fired.
