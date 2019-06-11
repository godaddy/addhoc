import React from 'react';
import PropTypes from 'prop-types';
import assume from 'assume';
import addhoc from '../index';
import { mount } from 'enzyme';

describe('addhoc', function () {
  it('is a function', function () {
    assume(addhoc).is.a('function');
  });

  let tree;
  afterEach(function () {
    if (tree) {
      tree.unmount();
      tree = null;
    }
  });

  it('can add a prop', function () {
    const TestComponent = () => <span />;
    const withFooProp = addhoc(getWrappedComponent => getWrappedComponent({ foo: true }));
    const TestComponentWithFoo = withFooProp(TestComponent);
    tree = mount(<TestComponentWithFoo />);
    const testComponent = tree.find('TestComponent');
    assume(testComponent.prop('foo')).is.true();
  });

  it('can do simple wrapping', function () {
    const TestComponent = () => <span />;
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>);
    const TestComponentWithDiv = withDiv(TestComponent);
    tree = mount(<TestComponentWithDiv />);
    const span = tree.find('span');
    assume(span.exists()).is.true();
    assume(span.closest('div').exists()).is.true();
  });

  it('hoists statics', function () {
    const TestComponent = () => <span />;
    TestComponent.myStatic = 'MOCK';
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>);
    const TestComponentWithDiv = withDiv(TestComponent);
    assume(TestComponentWithDiv.myStatic).is.a('string');
    assume(TestComponentWithDiv.myStatic).equals('MOCK');
  });

  it('augments the displayName properly when no HOC name is set', function () {
    const TestComponent = () => <span />;
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>);
    const TestComponentWithDiv = withDiv(TestComponent);
    tree = mount(<TestComponentWithDiv />);
    assume(tree.exists('WithHOC(TestComponent)')).is.true();
  });

  it('augments the displayName properly when a custom HOC name is set', function () {
    const TestComponent = () => <span />;
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>, 'WithDiv');
    const TestComponentWithDiv = withDiv(TestComponent);
    tree = mount(<TestComponentWithDiv />);
    assume(tree.exists('WithDiv(TestComponent)')).is.true();
  });

  it('augments the displayName of the returned Component when a custom HOC name is set', function () {
    const TestComponent = () => <div />;
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>, 'WithDiv');

    const TestComponentWithDiv = withDiv(TestComponent);
    assume(TestComponentWithDiv.displayName).equals('ForwardRef(WithDiv/TestComponent)');
  });

  it('augments the displayName of the returned Component when no HOC name is set', function () {
    const TestComponent = () => <div/>;
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>);

    const TestComponentWithDiv = withDiv(TestComponent);
    assume(TestComponentWithDiv.displayName).equals('ForwardRef(WithHOC/TestComponent)');
  });

  it('can create a HOC that uses the React 16 context API', function () {
    const TestComponent = props => <span>{ props.value }</span>;
    TestComponent.propTypes = {
      value: PropTypes.string
    };
    const TestContext = React.createContext('DEFAULT');
    const withContext = addhoc(getWrappedComponent =>
      <TestContext.Consumer>
        { value => getWrappedComponent({ value }) }
      </TestContext.Consumer>);
    const TestComponentWithContext = withContext(TestComponent);
    tree = mount(
      <React.Fragment>
        <TestContext.Provider value='PROVIDED'>
          <TestComponentWithContext />
        </TestContext.Provider>
      </React.Fragment>
    );

    const span = tree.find('span');
    assume(span.text()).equals('PROVIDED');
  });

  it('forwards refs', function () {
    class TestComponent extends React.Component {
      // Used to test ref forwarding
      getMockData() {
        return 'MOCK_DATA';
      }

      render() {
        return (
          <span />
        );
      }
    }
    const withDiv = addhoc(getWrappedComponent =>
      <div>
        { getWrappedComponent() }
      </div>);
    const TestComponentWithDiv = withDiv(TestComponent);
    class TestRefComponent extends React.Component {
      constructor(...args) {
        super(...args);
        this.componentRef = React.createRef();
        this.state = {
          updated: false,
          data: null
        };
      }

      componentDidMount() {
        this.setState({
          updated: true,
          data: this.componentRef.current.getMockData()
        });
      }

      render() {
        return (
          <React.Fragment>
            <TestComponentWithDiv ref={ this.componentRef } />
            <span className='data'>{ this.state.data }</span>
          </React.Fragment>
        );
      }
    }

    tree = mount(
      <TestRefComponent />
    );

    assume(tree.state('updated')).is.true();
    assume(tree.find('.data').text()).equals('MOCK_DATA');
  });

  it('passes through extra args to the HOC renderFn', function () {
    const TestComponent = () => <span />;
    const withFooProp = addhoc((getWrappedComponent, extra) => getWrappedComponent({ foo: extra }), 'WithFoo', 'EXTRA');
    const TestComponentWithFoo = withFooProp(TestComponent);
    tree = mount(<TestComponentWithFoo />);
    const testComponent = tree.find('TestComponent');
    assume(testComponent.prop('foo')).equals('EXTRA');
  });
});
