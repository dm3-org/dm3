import { fireEvent, render } from '@testing-library/react';
import DeleteMessage from './DeleteMessage';
import '@testing-library/jest-dom';

describe('DeleteMessage test cases', () => {
    it('Renders DeleteMessage component', () => {
        const { container } = render(<DeleteMessage />);
        const element = container.getElementsByClassName(
            'delete-msg-modal-content',
        );
        expect(element[0]).toBeInTheDocument();
    });

    it('Fetch Delete Message heading', () => {
        const { getByText } = render(<DeleteMessage />);
        const element = getByText('Delete Message');
        expect(element).toBeInTheDocument();
    });

    it('Fetch Delete Message content', () => {
        const { getByText } = render(<DeleteMessage />);
        const element = getByText(
            'This message will be deleted from your inbox and' +
                ' a request for deletion will be sent to the other person.',
        );
        expect(element).toBeInTheDocument();
    });

    it('Fetch line separator', () => {
        const { container } = render(<DeleteMessage />);
        const element = container.getElementsByClassName('line-separator');
        expect(element[0]).toBeInTheDocument();
    });

    it('Click on button to close delete message popup', () => {
        const { container } = render(<DeleteMessage />);
        const element = container.getElementsByClassName(
            'preferences-close-icon',
        );
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });

    it('Click on button to delete message', () => {
        const { container } = render(<DeleteMessage />);
        const element = container.getElementsByClassName('delete-msg-btn');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });
});
