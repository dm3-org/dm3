import { fireEvent, render } from '@testing-library/react';
import { ReplyMessagePreview } from './ReplyMessagePreview';
import '@testing-library/jest-dom';

describe('ReplyMessagePreview test cases', () => {
    const props = {
        setFiles: () => {},
    };

    it('Renders ReplyMessagePreview component', () => {
        const { container } = render(<ReplyMessagePreview {...props} />);
        const element = container.getElementsByClassName('reply-content');
        expect(element[0]).toBeInTheDocument();
    });

    it('Should render user address', () => {
        const { container } = render(<ReplyMessagePreview {...props} />);
        const element = container.getElementsByClassName('user-name');
        expect(element[0]).toBeInTheDocument();
    });

    it('Click on cancel reply message preview icon', () => {
        const { container } = render(<ReplyMessagePreview {...props} />);
        const element = container.getElementsByClassName('reply-close-icon');
        const action = fireEvent.click(element[0]);
        expect(action).toBe(true);
    });
});
