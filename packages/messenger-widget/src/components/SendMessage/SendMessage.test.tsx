import { fireEvent, render } from '@testing-library/react';
import { SendMessage } from './SendMessage';
import '@testing-library/jest-dom';

describe('SendMessage test cases', () => {
    const props = {
        message: 'Hello DM3',
        filesSelected: [],
        setFiles: () => {},
        setMessageText: () => {},
    };

    it('Renders SendMessage component', () => {
        const { getByRole } = render(<SendMessage {...props} />);
        const element = getByRole('span');
        expect(element).toBeInTheDocument();
    });

    it('Renders send message icon', () => {
        const { getByRole } = render(<SendMessage {...props} />);
        const element = getByRole('img');
        expect(element).toBeInTheDocument();
    });

    it('Click on send button icon', () => {
        const { getByRole } = render(<SendMessage {...props} />);
        const element = getByRole('img');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
