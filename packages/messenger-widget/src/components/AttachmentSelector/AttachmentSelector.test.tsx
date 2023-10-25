import { render, fireEvent } from '@testing-library/react';
import { AttachmentSelector } from './AttachmentSelector';
import '@testing-library/jest-dom';

describe('AttachmentSelector test cases', () => {
    const props = {
        filesSelected: [],
        setFiles: () => {},
    };

    it('Renders AttachmentSelector component', () => {
        const { getByTestId } = render(<AttachmentSelector {...props} />);
        const attachmentElement = getByTestId('attachments');
        expect(attachmentElement).toBeInTheDocument();
    });

    it('Open attachment selector', () => {
        const { getByTestId } = render(<AttachmentSelector {...props} />);
        const attachmentElement = getByTestId('attachment-selector');
        const result = fireEvent.click(attachmentElement);
        expect(result).toBe(true);
    });
});
