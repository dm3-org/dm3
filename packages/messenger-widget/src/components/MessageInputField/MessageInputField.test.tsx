import { fireEvent, render } from '@testing-library/react';
import { MessageInputField } from './MessageInputField';
import '@testing-library/jest-dom';

describe('MessageInputField test cases', () => {
    const props = {
        message: 'Hello DM3',
        filesSelected: [],
        setFiles: () => {},
        setMessageText: () => {},
    };

    it('Fetch input field to write a message', () => {
        const { getByTestId } = render(<MessageInputField {...props} />);
        const element = getByTestId('msg-input');
        expect(element).toBeInTheDocument();
    });

    it('On change of a message', () => {
        const { getByTestId } = render(<MessageInputField {...props} />);
        const input = getByTestId('msg-input');
        const action = fireEvent.change(input, {
            target: { value: 'testing on...' },
        });
        expect(action).toBe(true);
    });
});
