# StateManager

Used for simple state management. It is ideal for states that depend on a finite set of values. For example types of alert messages ('success', 'warning', 'error', 'info'). You can manage the state of an alert message by taking each type as a state.

## Constructor

### Signature

```js
constructor(options);
```

### Params

- `options`:
  - Type: `object`
  - Description: Contains the options for StateManager.

#### `options`

- `name`: (optional)
  - Type: `string`
  - Description: The name of the state manager. This helps in identifying the state manager in situations like debugging.
- `initialState`:
  - Type: `string`
  - Description: The initial state of the state manager. This is the state to which StateManager.current will be set initially.
- `states`: (optional)
  - Type: `array`
  - Description: The list of [StateOption](#stateoption)s. It contains the name of the state, observers, and transitions. You need to provide this option if you haven't provided options.contexts.
- `contexts`: (optional)
  - Type: `object`
  - Description: Contains [states] under different contexts. Each property key is the name of the context and the value is an array of [StateOption]s. StateManager only uses states that match the context specified. You need to provide this option if you haven't provided option.states. You need to provide the option options.context if you have provided this option.
- `context`: (Optional)
  - Type: `string`
  - Description: The name of the context that the StateManager is in. You need to provide this option if you have provided the option options.contexts.
- `saveHistory`:
  - Type: `boolean`
  - Description: Specifies whether or not to save the history of the state changes.
- `onSuspense`:
  - Type: `function`
  - Description: Called when StateManager has been put in suspense. This can happen when state transitions have been specified on some states and an illegal transition has been attempted.
  - Signature: `onSuspense(stateEvent)`
  - Params:
    - `stateEvent`:
    - Type: [`StateEvent`](state-event.md)
    - Description: The state event emitted due to the state transition. StateEvent.name will be the name of the state that you attempted to change to.
  - Returns: `undefined`

##### `StateOption`

An object containing the options for each state.

###### Properties

- `name`:
  - Type: `string`
  - Description: The name of the state.
- `observers`:
  - Type: `array`
  - Description: The observers for that event. See [`stateObserver`](#stateobserver) for more.
- `transitions`:
  - Type: `object`
  - Description: The transitions permitted. If a state has transitions specified, any transition attempted that has not been specified will put the state manager in suspense. See [`StateTransitions`](#statetransitions) for more.

##### `stateObserver`

###### Signature

```js
stateObserver(stateEvent);
```

###### Params

- `stateEvent`:
  - Type: [`StateEvent`](state-event.md)
  - Description: The event fired when the state transitions.

##### `stateTransitions`

Specifies the transitions allowed for a particular state. It has the following properties:

- `from`:
  - Type: `object`
  - Description: Specifies the states from which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states from which the current state can transition.
    - `observers`:
      - Type: `array` of [`stateObserver`](#stateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.
- `to`:
  - Type: `object`
  - Description: Specifies the states to which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states to which the current state can transition.
    - `observers`:
      - Type: `array` of [`stateObserver`](#stateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.

## Properties

- `name`: (readonly)
  - Type: `string`
  - Description: The name of the state manager.
- `current`:
  - Type: `string`
  - Description: The current state.
- `_current`: (protected)
  - Type: `string`
  - Description: The current state.
- `eventManager`: (protected)
  - Type: `object`
  - Description: The event manager. Manages the state events.
- `previous`:
  - Type: `string`
  - Description: The previous state.
- `history`:
  - Type: `array` of `string`s
  - Description: The history of the states.
- `saveHistory`:
  - Type: `boolean`
  - Description: Specifies whether or not to save the history.
- `context`:
  - Type: `string`
  - Description: The context in which the StateManager was created.
- `transitions`:
  - Type: `object`
  - Description: Contains the permitted transitions that the StateManager should carry out.
- `states`:
  - Type: `array` of `string`s
  - Description: A list of all registered states.

## Methods

### `stateIsRegistered`

Used to check if a particular state is registered. The states come from the options provided to the constructor of StateManager.

#### Signature

```js
stateIsRegistered();
```

#### Returns

A `boolean` indicating whether the state is registered or not.

### createEventManager

Creates an event manager for the state manager.

#### Signature

```js
createEventManager(states);
```

#### Params

- `states`:
  - Type: `array`
  - Description: An array of state objects provided in `options.states` or `options.contexts`.

#### Returns

An event manager for the state manager.

### `createEventManagerObserver`

Creates an observer for event changes.

#### Signature

```js
createEventManagerObserver(stateObserver);
```

#### Params

- `stateObserver`:
  - Type: `function`
  - Description: A state observer.

#### Returns

An event observer.

### `addObserver`

Adds an observer for a particular state. The observer is called every time the state changes, or before a transition.

#### Signature

```js
addObserver(state, observer);
```

#### Params

- `state`:
  - Type: `string`
  - Description: The state to be observed.
- `observer`:
  - Type: `function`
  - Description: The observer of a state.

### `removeObserver`

Removes an observer for a particular state.

#### Signature

```js
removeObserver(state, observer);
```

#### Params

- `state`:
  - Type: `string`
  - Description: The state observed.
- `observer`:
  - Type: `function`
  - Description: The observer of a state.

### `onSuspense`

A callback function for suspense. It is called when the state manager is in suspense. This can happen when an illegal state transition is attempted.

#### Signature

```js
onSuspense(stateEvent);
```

#### Params

- `stateEvent`:
  - Type: `StateEvent`
  - Description: The state event emitted due to the suspense. StateEvent.name will be the name of the state that was attempted.
