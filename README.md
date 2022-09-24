# state-manager

A JavaScript library for state management and automation. It can be used on both the frontend and backend.

## Installation

### NPM

```sh
npm install @web-deps/state-manager
```

### Yarn

```sh
yarn add @web-deps/state-manager
```

## Usage

### Creating a State Manager

```js
import { StateManager } from "@web-deps/state-manager";

const states = [
  {
    name: "success",
    observers: [
      (stateEvent) => {
        console.log(stateEvent.name);
      }
    ]
  },
  {
    name: "error",
    observers: [
      (stateEvent) => {
        console.log(stateEvent.name);
      }
    ]
  },
  {
    name: "warning",
    observers: [
      (stateEvent) => {
        console.log(stateEvent.name);
      }
    ]
  },
  {
    name: "info",
    observers: [
      (stateEvent) => {
        console.log(stateEvent.name);
      }
    ]
  }
];

let alertType = new StateManager({
  name: "AlertType",
  initialState: "success",
  states
});

console.log(alertType.current); // 'success'
```

### Changing State

```js
// Import StateManager and create instance 'alertType'

alertType.current = "error"; // Output 'error'
```

### Adding Observers

```js
// Import StateManager and create instance 'alertType'

alertType.addObserver("warning", () => {
  console.log("Giving some warning message.");
});

alertType.current = "waring";
// Output
// 'waring'
// 'Giving some warning message.'
```

## API

- [CollectionStateEvent](docs/api/collection-state-event.md)
- [CollectionStateManager](docs/api/collection-state-manager.md)
- [DataStateEvent](docs/api/data-state-event.md)
- [DataStateManager](docs/api/data-state-manager.md)
- [StateEvent](docs/api/state-event.md)
- [StateManager](docs/api/state-manager.md)

## License

MIT License.
