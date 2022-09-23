# CollectionStateEvent

Used to create an event triggered by a state change or suspense of [`CollectionStateManager`]().

## Constructor

### Signature

```js
constructor(state, collectionStateManager, data);
```

### Params

- `state`:
  - Type: `string`
  - Description: The state causing the event.
- `collectionStateManager`:
  - Type: [`CollectionStateManager`]()
  - Description: The CollectionStateManager emitting the event.
- `combination`:
  - Type: `any`
  - Description: The data associated with the state.

## Properties

- `name`:
  - Type: `string`
  - Description: The name of the event. This is one of the states.
- `subject`:
  - Type: [`DataStateManager`]()
  - Description: The state manager emitting the event.
- `combination`:
  - Type: `any`
  - Description: The combination of values associated with the state or suspense.
