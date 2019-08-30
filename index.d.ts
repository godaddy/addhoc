declare module 'addhoc' {
  import { ComponentType } from 'react';

  export type getWrappedComponentFunction = (additionalProps?: Object) => ComponentType;

  export type renderFunction = (
    getWrappedComponent: getWrappedComponentFunction,
    ...extraHOCArgs: any
  ) => ComponentType | JSX.Element;

  export type withHOCFunction = (component: ComponentType) => any;

  export function addhoc(
    renderFn: renderFunction,
    name?: string,
    ...extraHOCArgs: any
  ): withHOCFunction;

  export default addhoc;
}
