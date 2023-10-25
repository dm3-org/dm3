import { render } from '@testing-library/react';
import { Chat } from './Chat';
import '@testing-library/jest-dom';

describe('Chat test cases', () => {
    it('Renders Chat component', () => {
        const { getByRole } = render(<Chat />);
        const element = getByRole('div');
        expect(element).toBeInTheDocument();
    });

    it('Render chat container', () => {
        const { container } = render(<Chat />);
        const element = container.getElementsByClassName('chat-container');
        expect(element).toBeInTheDocument();
    });

    it('Render chat messages container', () => {
        const { container } = render(<Chat />);
        const element = container.getElementsByClassName('chat-items');
        expect(element).toBeInTheDocument();
    });
});
