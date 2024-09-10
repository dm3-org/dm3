import { fireEvent, render } from '@testing-library/react';
import { EmojiSelector } from './EmojiSelector';
import '@testing-library/jest-dom';

describe('EmojiSelector test cases', () => {
    it('Renders EmojiSelector component', () => {
        const { getByTestId } = render(<EmojiSelector />);
        const element = getByTestId('emoji-modal-handler');
        expect(element).toBeInTheDocument();
    });

    it('Click on button to open emoji selector modal', () => {
        const { getByTestId } = render(<EmojiSelector />);
        const element = getByTestId('emoji-modal-handler');
        const action = fireEvent.click(element);
        expect(action).toBe(true);
    });
});
