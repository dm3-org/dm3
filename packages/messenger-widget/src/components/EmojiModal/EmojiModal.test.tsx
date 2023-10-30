import { render } from '@testing-library/react';
import { EmojiModal } from './EmojiModal';
import '@testing-library/jest-dom';

describe('EmojiModal test cases', () => {
    const props = {
        message: 'some message',
        setMessage: () => {},
    };

    it('Renders EmojiModal component', () => {
        const { container } = render(<EmojiModal {...props} />);
        const element = container.getElementsByClassName(
            'emoji-modal-container',
        );
        expect(element[0]).toBeInTheDocument();
    });
});
