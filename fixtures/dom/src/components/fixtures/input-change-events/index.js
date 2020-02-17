import FixtureSet from '../../FixtureSet';
import TestCase from '../../TestCase';
import RangeKeyboardFixture from './RangeKeyboardFixture';
import RadioClickFixture from './RadioClickFixture';
import RadioGroupFixture from './RadioGroupFixture';
import RadioNameChangeFixture from './RadioNameChangeFixture';
import InputPlaceholderFixture from './InputPlaceholderFixture';
const React = window.React;

class InputChangeEvents extends React.Component {
  render() {
    return (
      <FixtureSet
        title="Input change events"
        description="Tests proper behavior of the onChange event for inputs">
        <TestCase
          title="Range keyboard changes"
          description={`
            Range inputs should fire onChange events for keyboard events
          `}>
          <TestCase.Steps>
            <li>Focus range input</li>
            <li>change value via the keyboard arrow keys</li>
          </TestCase.Steps>

          <TestCase.ExpectedResult>
            The <code>onKeyDown</code> call count should be equal to the{' '}
            <code>onChange</code> call count.
          </TestCase.ExpectedResult>

          <RangeKeyboardFixture />
        </TestCase>

        <TestCase
          title="Radio input clicks"
          description={`
            Radio inputs should only fire change events when the checked
            state changes.
          `}
          resolvedIn="16.0.0">
          <TestCase.Steps>
            <li>Click on the Radio input (or label text)</li>
          </TestCase.Steps>

          <TestCase.ExpectedResult>
            The <code>onChange</code> call count should remain at 0
          </TestCase.ExpectedResult>

          <RadioClickFixture />
        </TestCase>
        <TestCase
          title="Uncontrolled radio groups"
          description={`
            Radio inputs should fire change events when the value moved to
            another named input
          `}
          introducedIn="15.6.0">
          <TestCase.Steps>
            <li>Click on the "Radio 2"</li>
            <li>Click back to "Radio 1"</li>
            <li>Click back to "Radio 2"</li>
          </TestCase.Steps>

          <TestCase.ExpectedResult>
            The <code>onChange</code> call count increment on each value change
            (at least 3+)
          </TestCase.ExpectedResult>

          <RadioGroupFixture />
        </TestCase>

        <TestCase
          title="Inputs with placeholders"
          description={`
            Text inputs with placeholders should not trigger changes
            when the placeholder is altered
          `}
          resolvedIn="15.0.0"
          resolvedBy="#5004"
          affectedBrowsers="IE9+">
          <TestCase.Steps>
            <li>Click on the Text input</li>
            <li>Click on the "Change placeholder" button</li>
          </TestCase.Steps>

          <TestCase.ExpectedResult>
            The <code>onChange</code> call count should remain at 0
          </TestCase.ExpectedResult>

          <InputPlaceholderFixture />
        </TestCase>
        <TestCase
          title="Radio button groups with name changes"
          description={`
            A radio button group should have correct checked value when
            the names changes
          `}
          resolvedBy="#11227"
          affectedBrowsers="IE9+">
          <TestCase.Steps>
            <li>Click the toggle button</li>
          </TestCase.Steps>

          <TestCase.ExpectedResult>
            The checked radio button should switch between the first and second
            radio button
          </TestCase.ExpectedResult>

          <RadioNameChangeFixture />
        </TestCase>
      </FixtureSet>
    );
  }
}

export default InputChangeEvents;
