# DataStateManager

Used to manage states that depend on data that may not have a small finite set of values. This state manager is ideal for managing states that depend on data that have a huge set of values or infinite values. For example, a password that has states 'weak', 'strong', and 'very-strong' depends on the nature of the password string. The string can have a large number of possible combinations despite the states being a small set. You can use DataStateManager to react to the nature of the password and change the state of the password accordingly.

## Constructor

### Signature

```js
constructor(options);
```

### Params

- `options`:
  - Type: `object`
  - Description: The options for the constructor.

#### `options`

Extends [StateOptions]().

- `states`:
  - Type: `array`
  - Description: The [`DataStateOption`]()s of the state manager.
- `initialData`:
  - Type: `any`
  - Description: The initial data.
- `contexts`:
  - Type: `object`
  - Description: Contains the contexts in which the state manager can be. Each key is the name of the context and the value is the states in that context.
- `onUpdate`:
  - Type: `function`
  - Description: The callback called every time the data is updated.
- `onSuspense`:
  - Type: `function`
  - Description: The callback called every time the state manager is in put in suspense. The manager can be put in suspense when an illegal transition has been attempted.

##### `DataStateOption`

An object containing the options for each state.

###### Properties

- `name`:
  - Type: `string`
  - Description: The name of the state.
- `observers`:
  - Type: `array`
  - Description: The observers for that event. See [`dataStateObserver`]() for more.
- `transitions`:
  - Type: `object`
  - Description: The transitions permitted. If a state has transitions specified, any transition attempted that has not been specified will put the state manager in suspense. See [`DataStateTransitions`]() for more.

##### `dataStateObserver`

###### Signature

```js
dataStateObserver(dataStateEvent);
```

###### Params

- `dataStateEvent`:
  - Type: [`DataStateEvent`](data-state-event.md)
  - Description: The event fired when the state transitions.

##### dataStateTransitions

Specifies the transitions allowed for a particular state. It has the following properties:

- `from`:
  - Type: `object`
  - Description: Specifies the states from which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states from which the current state can transition.
    - `observers`:
      - Type: `array` of [`dataStateObserver`](#datastateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.
- `to`:
  - Type: `object`
  - Description: Specifies the states to which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states to which the current state can transition.
    - `observers`:
      - Type: `array` of [`dataStateObserver`](#datastateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.

## Properties

Extends [StateManager]().

- `currentData`:
  - Type: `any`
  - Description: The current data of the state manager. This is the data that the manager depends on for state transitions. It is the nature of the data that triggers a transition.
- `tests`:
  - Type: `array`
  - Description: The list of tests to be carried out on data update to find matches. When a match has been found, the state is set to the state associated with the match.
- `observers`:
  - Type: `object`
  - Description: The list of observers for states. The keys are the states, and the values are arrays of all observers for the state specified in the corresponding key. The observers are the ones passed in `options.states` or `options.contexts`.
- `stateManager`:
  - Type: [`StateManager`]()
  - Description: The state manager used for managing the state transitions.

### Methods

#### `createStateManagerStates`

Creates states for [StateManager]() from the states for [DataStateManager](#datastatemanager).

#### Signature

```js
createStateManagerStates(states);
```

#### Params

- `states`:
  - Type: [`StateOptions`]()
  - Description: DataStateManager states.

#### Returns

[`StateOption`]()s.

### `addObserver`

Adds a new observer for a particular state.

#### Signature

```js
addObserver(state, observer);
```

#### Params

- `state`:
  - Type: `string`
  - Description: The name of the state to be observed.
- `observer`:
  - Type: `function`
  - Description: The function to be called when the state changes.

### `removeObserver`

Removes an observer for a particular state.

#### Signature

```js
removeObserver(state, observer);
```

#### Params

- `state`:
  - Type: `string`
  - Description: The name of the state observed.
- `observer`:
  - Type: `function`
  - Description: The function to be removed.

### `notifyObservers`

Same signature as [StateManager.notifyObservers](). But, it notifies the observers of DataStateManager.

### `update`

Updates data. When the updated data matches a state different from the current one, a transition to the new state is triggered.

#### Signature

```js
update(data);
```

#### Params

- data:
  - Type: `any`
  - Description: The data to update to.

### `onUpdate`

The callback function called when the data has been updated.

#### Signature

```js
onUpdate(data);
```

#### Params

- `data`:
  - Type: `any`
  - Description: The updated data.

### `onSuspense`

The function called when DataStateManager has been put in suspense. This can happen when an illegal transition has been attempted. The state is not changed in this case.

#### Signature

```js
onSuspense(dataStateEvent);
```

#### Params

- `dataStateEvent`:
  - Type: [`DataStateEvent`]()
  - Description: The event emitted due to the suspense.
