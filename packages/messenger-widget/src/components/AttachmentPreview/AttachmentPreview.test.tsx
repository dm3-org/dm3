import { render, fireEvent } from '@testing-library/react';
import { AttachmentPreview } from './AttachmentPreview';
import '@testing-library/jest-dom';

describe('AttachmentPreview test cases', () => {
    const attachments = [
        {
            id: '1',
            data:
                'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
                'the-essential-guide-to-using-images-legally-online.png',
            name: 'file-1',
            isImage: true,
        },
        {
            id: '2',
            data: 'https://www.africau.edu/images/default/sample.pdf',
            name: 'file-2',
            isImage: false,
        },
    ];

    const props = {
        filesSelected: attachments,
        setFiles: () => {},
    };

    it('Renders AttachmentPreview component', () => {
        const onClickMock = jest.fn();
        props.setFiles = onClickMock;
        const { getByTestId } = render(<AttachmentPreview {...props} />);
        const data = getByTestId('attachment-preview-testid');
        expect(data).toBeInTheDocument();
    });

    it('Image is preset in the attachment list', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const file = await findByTestId(props.filesSelected[0].id);
        expect(file).toBeInTheDocument();
    });

    it('PDF is preset in the attachment list', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const file = await findByTestId(props.filesSelected[1].id);
        expect(file).toBeInTheDocument();
    });

    it('Image icon is rendered', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const image = await findByTestId(props.filesSelected[0].name);
        expect(image).toBeInTheDocument();
    });

    it('PDF icon is rendered', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const file = await findByTestId(props.filesSelected[1].name);
        expect(file).toBeInTheDocument();
    });

    it('Image file name is rendered', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const image = await findByTestId(
            `${props.filesSelected[0].id}-${props.filesSelected[0].name}`,
        );
        expect(image).toBeInTheDocument();
    });

    it('PDF file name is rendered', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const file = await findByTestId(
            `${props.filesSelected[1].id}-${props.filesSelected[1].name}`,
        );
        expect(file).toBeInTheDocument();
    });

    it('Click removes attachment selected', async () => {
        const { findByTestId } = render(<AttachmentPreview {...props} />);
        const removeFile = await findByTestId(props.filesSelected[0].id);
        const result = fireEvent.click(removeFile);
        expect(result).toBe(true);
    });
});
