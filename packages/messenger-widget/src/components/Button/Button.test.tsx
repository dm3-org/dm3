import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

describe('Button test cases', () => {
    const props = {
        buttonText: 'Submit',
        actionMethod: () => true,
    };

    it('Renders Button component', () => {
        const { getByTestId } = render(<Button {...props} />);
        const data = getByTestId('common-button');
        expect(data).toBeInTheDocument();
    });

    it('Renders a button with the provided label', () => {
        const { getByText } = render(<Button {...props} />);
        const button = getByText('Submit');
        expect(button).toBeInTheDocument();
    });

    it('Calls the provided onClick function when the button is clicked', () => {
        const onClickMock = jest.fn();
        props.actionMethod = onClickMock;
        const { getByText } = render(<Button {...props} />);
        const button = getByText('Submit');
        fireEvent.click(button);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});
