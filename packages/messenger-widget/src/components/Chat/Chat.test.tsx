import { render } from '@testing-library/react';
import { Chat } from './Chat';
import '@testing-library/jest-dom';

describe('Chat test cases', () => {
    it('Renders Chat component', () => {
        const { getByText } = render(<Chat />);
        const element = getByText(
            'This contact hasn’t published the dm3 profile yet.',
        );
        expect(element).toBeInTheDocument();
    });
});
