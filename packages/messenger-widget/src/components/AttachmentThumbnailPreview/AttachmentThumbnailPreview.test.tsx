import { render, fireEvent, screen } from '@testing-library/react';
import { AttachmentThumbnailPreview } from './AttachmentThumbnailPreview';
import '@testing-library/jest-dom';

describe('AttachmentThumbnailPreview test cases', () => {
    const imageAttachment = {
        id: '1',
        data:
            'https://www.searchenginejournal.com/wp-content/uploads/2019/07/' +
            'the-essential-guide-to-using-images-legally-online.png',
        name: 'file-1',
        isImage: true,
    };

    const pdfAttachment = {
        id: '2',
        data: 'https://www.africau.edu/images/default/sample.pdf',
        name: 'file-2',
        isImage: false,
    };

    it('Renders AttachmentThumbnailPreview component for message sender', () => {
        const senderProps = {
            filesSelected: [imageAttachment, pdfAttachment],
            isMyMessage: true,
        };
        const { getByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );
        const data = getByTestId('thumbnail-container');
        expect(data).toBeInTheDocument();
    });

    it('Renders AttachmentThumbnailPreview component for message receiver', () => {
        const receiverProps = {
            filesSelected: [imageAttachment, pdfAttachment],
            isMyMessage: false,
        };
        const { getByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );
        const data = getByTestId('thumbnail-container');
        expect(data).toBeInTheDocument();
    });

    it('Single image preview in a message on senders screen', async () => {
        const senderProps = {
            filesSelected: [imageAttachment],
            isMyMessage: true,
        };
        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );
        const file = await findByTestId('single-image');
        expect(file).toBeInTheDocument();
    });

    it('Single image preview in a message on receivers screen', async () => {
        const receiverProps = {
            filesSelected: [imageAttachment],
            isMyMessage: false,
        };
        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );
        const file = await findByTestId('single-image');
        expect(file).toBeInTheDocument();
    });

    it('Single PDF preview in a message on senders screen', async () => {
        const senderProps = {
            filesSelected: [pdfAttachment],
            isMyMessage: true,
        };
        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );
        const file = await findByTestId(pdfAttachment.id);
        expect(file).toBeInTheDocument();
    });

    it('Single PDF preview in a message on receivers screen', async () => {
        const receiverProps = {
            filesSelected: [pdfAttachment],
            isMyMessage: false,
        };
        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );
        const file = await findByTestId(pdfAttachment.id);
        expect(file).toBeInTheDocument();
    });

    it('Multiple files preview in a message on senders screen', async () => {
        const senderProps = {
            filesSelected: [pdfAttachment, imageAttachment],
            isMyMessage: true,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );

        const file1 = await findByTestId(pdfAttachment.id);
        const file2 = await findByTestId(imageAttachment.id);

        expect(file1).toBeInTheDocument();
        expect(file2).toBeInTheDocument();
    });

    it('Multiple files preview in a message on receivers screen', async () => {
        const receiverProps = {
            filesSelected: [pdfAttachment, imageAttachment],
            isMyMessage: false,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );

        const file1 = await findByTestId(pdfAttachment.id);
        const file2 = await findByTestId(imageAttachment.id);

        expect(file1).toBeInTheDocument();
        expect(file2).toBeInTheDocument();
    });

    it('Click to enlarge the image in message on senders screen with single file', async () => {
        const senderProps = {
            filesSelected: [imageAttachment],
            isMyMessage: true,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );

        const image = await findByTestId('single-image');
        fireEvent.click(image);

        const imageModal = screen.getByTestId('image-view-modal');
        expect(imageModal).toBeInTheDocument();
    });

    it('Click to enlarge the image in message on senders receiver with single file', async () => {
        const receiverProps = {
            filesSelected: [imageAttachment],
            isMyMessage: true,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );

        const image = await findByTestId('single-image');
        fireEvent.click(image);

        const imageModal = screen.getByTestId('image-view-modal');
        expect(imageModal).toBeInTheDocument();
    });

    it('Click to enlarge the image in message on senders screen with multiple file', async () => {
        const senderProps = {
            filesSelected: [imageAttachment, pdfAttachment],
            isMyMessage: true,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...senderProps} />,
        );

        const image = await findByTestId(imageAttachment.id);
        fireEvent.click(image);

        const imageModal = screen.getByTestId('image-view-modal');
        expect(imageModal).toBeInTheDocument();
    });

    it('Click to enlarge the image in message on senders receiver with multiple file', async () => {
        const receiverProps = {
            filesSelected: [imageAttachment, pdfAttachment],
            isMyMessage: true,
        };

        const { findByTestId } = render(
            <AttachmentThumbnailPreview {...receiverProps} />,
        );

        const image = await findByTestId(imageAttachment.id);
        fireEvent.click(image);

        const imageModal = screen.getByTestId('image-view-modal');
        expect(imageModal).toBeInTheDocument();
    });
});
