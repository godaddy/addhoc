# addhoc

Handy little helper to create proper HOC functions complete with hoisted statics and forwarded refs

## Motivation

As defined in the [React documentation], a Higher Order Component, or HOC, is a function that returns a React component
that wraps a specified child component and often provides augmented functionality. Implementing HOCs can be hard,
especially when considering hoisting statics, managing `ref` forwarding, and handling display name. `addhoc` aims to
handle these challenges for you.

## Benefits

`addhoc` creates HOC functions that automatically:

- [pass through unrelated `props`](https://reactjs.org/docs/higher-order-components.html#convention-pass-unrelated-props-through-to-the-wrapped-component)
- [wrap the display name for easy debugging](https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging)
- [hoist non-React statics](https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over)
- [forward `refs`](https://reactjs.org/docs/higher-order-components.html#refs-arent-passed-through)

## Installation

```bash
npm install addhoc
```

### API

```ts
/**** Public API ****/
// This is the main exported entrypoint
addhoc(renderFn: Function, [name: String = 'WithHOC'], [...extraArgs]): Function

/**** Signatures, not exported API ****/
// This is the signature of the renderFn parameter to addhoc()
renderFn(getWrappedComponent: Function, [...extraArgs]): React.Component

// This is the signature of the getWrappedComponent parameter to renderFn()
getWrappedComponent([additionalProps: Object]): React.Component
```

## Usage

`addhoc` is a function that returns a HOC function. To construct your HOC, you simply pass a callback that acts as the
render function of your top-level component. Your callback is provided a function parameter that returns the wrapped
child that's initially provided to the HOC. You can call that callback with an object of `props` to add to the wrapped
component.

### Example 1: Adding a prop

```jsx
import addhoc from 'addhoc';
import MyComponent from './my-component';

const withFooProp = addhoc(getWrappedComponent => getWrappedComponent({ foo: true }), 'WithFooProp');
const MyComponentWithFoo = withFooProp(MyComponent);
// Rendering a MyComponentWithFoo will create a MyComponent with prop foo = true
```

### Example 2: Wrapping in another component

```jsx
import React from 'react';
import addhoc from 'addhoc';
import MyComponent from './my-component';

const withDiv = addhoc(getWrappedComponent =>
  <div>
    { getWrappedComponent() }
  </div>, 'WithDiv');
const MyComponentWithDiv = withDiv(MyComponent);
// Rendering a MyComponentWithDiv will render a div that wraps a MyComponent
```

### Example 3: React 16 Context consumer

```jsx
import React from 'react';
import addhoc from 'addhoc';
import MyComponent from './my-component';

const MyContext = React.createContext('DefaultValue');
const withMyContext = addhoc(getWrappedComponent =>
  <MyContext.Consumer>
    { value => getWrappedComponent({ value }) }
  </MyContext.Consumer>, 'WithMyContext');
const MyComponentWithMyContext = withMyContext(MyComponent);

// ...
render() {
  return <MyContext.Provider value='ProvidedValue'>
    <MyComponentWithMyContext />
  </MyContext.Provider>
}

// Now, the MyComponentWithMyContext automatically gets a prop called `value` that gets the context value passed in from
// the context.
```

### Example 4: Passing through configuration

Sometimes, you want to set some values as part of assembling the HOC and have those available in your render function.
You can pass arbitrary parameters after the `name` param to `addhoc` and they'll be passed through as additional
parameters to your render function:

```jsx
import addhoc from 'addhoc';
import MyComponent from './my-component';

const withFooProp = addhoc((getWrappedComponent, extra) => getWrappedComponent({ foo: extra }), 'WithFoo', 'EXTRA');
const MyComponentWithFoo = withFooProp(MyComponent);
// Rendering a MyComponentWithFoo will get a `foo` prop with value `EXTRA`
```

## Testing

```bash
npm test
```

[React documentation]: https://reactjs.org/docs/higher-order-components.html
