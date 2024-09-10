import './AttachmentThumbnailPreview.css';
import attachmentIcon from '../../assets/images/attachment.svg';
import { AttachmentPreviewProps } from '../../interfaces/props';
import { IAttachmentPreview } from '../../interfaces/utils';
import { useState } from 'react';
import { ImageViewModal } from '../ImageViewModal/ImageViewModal';

export function AttachmentThumbnailPreview(props: AttachmentPreviewProps) {
    // popup to show image
    const [imageUri, setImageUri] = useState<string | null>(null);

    function setImageToShow(uri: string) {
        setImageUri(uri);
    }

    function showImagePreview(item: IAttachmentPreview) {
        if (item.isImage) {
            setImageUri(item.data);
        }
    }

    return (
        <div
            data-testid="thumbnail-container"
            className={'d-flex pt-1 mb-2 align-items-center'.concat(
                ' ',
                props.filesSelected.length == 1 &&
                    props.filesSelected[0].isImage
                    ? 'justify-content-start'
                    : props.isMyMessage
                    ? 'justify-content-end'
                    : 'justify-content-start',
            )}
        >
            {/* Show image modal */}
            {imageUri && (
                <ImageViewModal setUri={setImageToShow} uri={imageUri} />
            )}

            {props.filesSelected.length == 1 &&
            props.filesSelected[0].isImage &&
            !props.isReplyMsgAttachments ? (
                // if only one attachment is present and it's a image
                <img
                    data-testid="single-image"
                    className="border-radius-6 image-thumbnail-preview pointer-cursor"
                    src={props.filesSelected[0].data}
                    alt="image"
                    onClick={() => showImagePreview(props.filesSelected[0])}
                />
            ) : (
                // more than one attachments
                props.filesSelected.map((item) => {
                    return (
                        <div
                            data-testid={item.id}
                            className="d-flex attachment-background border-radius-6 width-fit 
                        align-items-center p-2 me-1 pointer-cursor"
                            key={item.id}
                            onClick={() => showImagePreview(item)}
                        >
                            <img
                                className="border-radius-3 file-thumbnail-preview"
                                src={item.isImage ? item.data : attachmentIcon}
                                alt="file"
                            />
                            <div className="font-size-12 ms-1">{item.name}</div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
