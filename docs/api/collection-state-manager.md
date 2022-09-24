# CollectionStateManager

Used to manage states that depend on different combinations of a finite set of values. For example, in a text editor, text may have different font weights such as 'normal', 'bold', 'italic', 'bold-italic', and so on. Font weights like 'bold-italic' are a combination of 'bold' and 'italic' variants. So, taking the font weights as states, the state of the text depends on different combinations of values 'normal', 'bold', 'italic', and so on. CollectionStateManager is ideal for such cases.

## Constructor

### Signature

```js
constructor(options);
```

### Params

- `options`:
  - Type: `object`
  - Description: The options to pass to the constructor.

#### `options`

Extends [`StateOptions`](state-manager.md#constructor)

- `states`:
  - Type: `array`
  - Description: The [`CollectionStateOption`](#collectionstateoption)s of the state manager.
- `contexts`:
  - Type: `object`
  - Description: Contains the contexts in which the state manager can be. Each key is the name of the context and the value is the states in that context.
- `ordered`:
  - Type: `boolean`
  - Description: Indicates whether the order of the combinations of values for each state matters. If true, the same combination with a different order will not trigger a transition to that state. Instead, it will put the CollectionStateManager in suspense.
- `size`:
  - Type: `number`
  - Description: The fixed size of the combinations. If set, any combination with a different size will not trigger a transition. Instead, it will put the CollectionStateManager in suspense.
- `onSuspense`:
  - Type: `function`
  - Description: The callback called every time the state manager is in put in suspense. The manager can be put in suspense when an forbidden transition has been attempted. Or when an forbidden combination has been created.

##### `CollectionStateOption`

An object containing the options for each state.

###### Properties

- `name`:
  - Type: `string`
  - Description: The name of the state.
- `observers`:
  - Type: `array`
  - Description: The observers for that event. See [`collectionStateObserver`](#collectionstateobserver) for more.
- `transitions`:
  - Type: `object`
  - Description: The transitions permitted. If a state has transitions specified, any transition attempted that has not been specified will put the state manager in suspense. See [`CollectionStateTransitions`](#collectionstatetransitions) for more.

##### `collectionStateObserver`

###### Signature

```js
collectionStateObserver(collectionStateEvent);
```

###### Params

- `collectionStateEvent`:
  - Type: [`CollectionStateEvent`](collection-state-event.md)
  - Description: The event fired when the state transitions.

##### collectionStateTransitions

Specifies the transitions allowed for a particular state. It has the following properties:

- `from`:
  - Type: `object`
  - Description: Specifies the states from which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states from which the current state can transition.
    - `observers`:
      - Type: `array` of [`collectionStateObserver`](#collectionstateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.
- `to`:
  - Type: `object`
  - Description: Specifies the states to which the current state can transition. It also provides the observers for that transition.
  - Properties:
    - `states`:
      - Type: `array` of `string`s
      - Description: A list of states to which the current state can transition.
    - `observers`:
      - Type: `array` of [`collectionStateObserver`](#collectionstateobserver)s
      - Description: A list of observers for the transition. The observers are called every time the transition occurs.

## Properties

Extends [StateManager](state-manager.md).

- `currentCombination`:
  - Type: `array` of `string`s
  - Description: The current combination of the CollectionStateManager. This collection matches the current state.
- `ordered`:
  - Type: `boolean`
  - Description: Indicates whether the order of the combinations of values for each state matters. If true, the same combination with a different order will not trigger a transition to that state. Instead, it will put the CollectionStateManager in suspense.
- `size`:
  - Type: `number`
  - Description: The fixed size of the combinations. If set, any combination with a different size will not trigger a transition. Instead, it will put the CollectionStateManager in suspense.
- `combinations`:
  - Type: `object`
  - Description: The combinations for each state.
- `collection`:
  - Type: `Set`
  - Description: A collection of all the values that can be used to form combinations.
- `observers`:
  - Type: `object`
  - Description: The list of observers for states. The keys are the states, and the values are arrays of all observers for the state specified in the corresponding key. The observers are the ones passed in `options.states` or `options.contexts`.
- `inSuspense`:
  - Type: `boolean`
  - Description: Indicates whether or not the CollectionStateManager is in suspense.
- `stateManager`:
  - Type: [`StateManager`](state-manager)
  - Description: The state manager used for managing the state transitions.

## Methods

### `createStateManagerStates`

Creates states for [StateManager](state-manager.md) from the states for [CollectionStateManager](#collectionstatemanager).

#### Signature

```js
createStateManagerStates(states);
```

#### Params

- `states`:
  - Type: [`StateOptions`](state-manager.md#constructor)
  - Description: CollectionStateManager states.

#### Returns

### `setCombination`

Used for setting the combination of the state manager. If the combination matches a combination for a particular state, the state manager transitions the state to the matching state.

#### Signature

```js
setCombination(combination);
```

#### Params

- `combination`:
  - Type: `array` of `string`s
  - Description: A combination of values. All the values in the combination must be in any of the combinations for states.

### `matchesCombination`

Checks whether or not a given combination matches any of the combinations for states.

#### Params

- `combination`:
  - Type: `array` of `string`s
  - Description: A combination of values. All the values in the combination must be in any of the combinations for states.

### `appendItem`

Appends a value to the current combination of the state manager. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
appendItem(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to append to the current combination.

### `removeItem`

Removes a value from the current combination of the state manager. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
removeItem(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to remove from the current combination.

### `prependItem`

Prepends a value to the current combination of the state manager. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
prependItem(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to prepend to the current combination.

### `replaceItem`

Replaces a value in the current combination of the state manager. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
replaceItem(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to replace in the current combination.

### `popItem`

Removes the last value in the current combination of the state manager. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
popItem();
```

### `shiftItems`

Removes the last value in the current combination of the state manager. If a value has been provided the last value is replaced with the given value. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
shiftItems(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to replace the removed value.

### `unshiftItems`

Removes the first value from the current combination of the state manager. If a value is provided, the removed value will be replaced with the given value. If the new combination matches a combination for a particular state, the state manager transitions to the matching state.

#### Signature

```js
unshiftItems(item);
```

#### Params

- `item`:
  - Type: `string`
  - Description: The value to append to the current combination.

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

Notifies [collectionStateObserver](#collectionstateobserver)s on a state transition.

#### Signature

```js
notifyObservers(collectionStateEvent);
```

#### Params

- `collectionStateEvent`:
  - Type: [`CollectionStateEvent`](collection-state-event.md)
  - Description: An event emitted due to a state transition.
