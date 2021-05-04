import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';

/**
 * @typedef {Function} withHOC
 * Higher-Order Component function to provide some functionality.
 *
 * @param {React.Component} WrappedComponent The component to be augmented with additional functionality
 * @returns {React.Component} A wrapped component class that provides additional functionality
 */
/**
 * @callback getWrappedComponentFn
 * @param {Object} extraProps A set of extra props, if any, to add to the wrapped component
 * @returns {React.ReactElement} The component to wrap with your HOC
 */
/**
 * @callback renderFn
 * @param {getWrappedComponentFn} getWrappedComponent A function to get the component being wrapped
 * @param {...any} [extraHOCArgs] Any additional arguments that you passed into addhoc will be passed through
 * @returns {React.ReactElement} A React component tree that contains the wrapped component
 */
/**
 * Handy little helper to create proper HOC functions complete with hoisted statics and forwarded refs
 *
 * @param {renderFn} renderFn A function that renders your HOC with the wrapped component inside -- see examples
 * @param {String} [name] Optional name of the HOC, used to augment the displayName on the wrapped component
 * @param {...any} [extraHOCArgs] Any additional arguments that you want to be passed through to your render function
 * @returns {withHOC} A higher order component function that accepts a component and returns it wrapped in your HOC
 * @public
 */
export default function addhoc(renderFn, name = 'WithHOC', ...extraHOCArgs) {
  return function withHOC(WrappedComponent) {
    function WithHOC(props) {
      const { forwardedRef, ...rest } = props;

      return renderFn(extraProps => {
        return (
          <WrappedComponent
            ref={ forwardedRef }
            { ...rest }
            { ...extraProps } />
        );
      }, ...extraHOCArgs);
    }

    // Wrap display name per
    // https://reactjs.org/docs/higher-order-components.html#convention-wrap-the-display-name-for-easy-debugging
    WithHOC.displayName = `${name}(${getDisplayName(WrappedComponent)})`;

    // Copy over non-react statics per
    // https://reactjs.org/docs/higher-order-components.html#static-methods-must-be-copied-over
    hoistNonReactStatics(WithHOC, WrappedComponent);

    // Wrap namespaced component to forward refs per https://reactjs.org/docs/forwarding-refs.html
    const forwardRef = React.forwardRef((props, ref) => {
      return <WithHOC { ...props } forwardedRef={ ref } />;
    });

    // Also hoist statics onto forward ref for convenience
    hoistNonReactStatics(forwardRef, WrappedComponent);

    // Wrap display name per
    // https://reactjs.org/docs/forwarding-refs.html#displaying-a-custom-name-in-devtools
    forwardRef.displayName = `ForwardRef(${name}/${getDisplayName(WrappedComponent)})`;

    return forwardRef;
  };
}

/**
 * Gets display name of a given component
 *
 * @param {React.ComponentType} WrappedComponent The component to retrieve a display name for
 * @returns {String} The display name of the given component, or `Component` by default
 * @private
 */
function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
