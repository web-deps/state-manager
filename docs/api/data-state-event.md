# DataStateEvent

Used to create an event triggered by a state change of [DataStateManager](data-state-manager.md).

## Constructor

### Signature

```js
constructor(state, dataStateManager, data);
```

### Params

- `state`:
  - Type: `string`
  - Description: The state causing the event.
- `dataStateManager`:
  - Type: [`DataStateManager`](data-state-manager.md)
  - Description: The DataStateManager emitting the event.
- `data`:
  - Type: `any`
  - Description: The data associated with the state.

## Properties

- `name`:
  - Type: `string`
  - Description: The name of the event. This is one of the states.
- `subject`:
  - Type: [`DataStateManager`](data-state-manager.md)
  - Description: The state manager emitting the event.
- `data`:
  - Type: `any`
  - Description: The data associated with the state.
