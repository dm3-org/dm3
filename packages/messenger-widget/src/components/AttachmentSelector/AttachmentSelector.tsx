import { ChangeEvent } from 'react';
import fileIcon from '../../assets/images/file.svg';
import { Attachment } from '../../interfaces/utils';
import { isFileAImage } from '../MessageInputBox/bl';
import { AttachmentProps } from '../../interfaces/props';
import { generateRandomStringForId } from '../../utils/common-utils';

export function AttachmentSelector(props: AttachmentProps) {
    // method to open system default file chooser
    const openAttachmentSelector = () => {
        let filePopup = document.getElementById('attachments') as HTMLElement;
        filePopup.click();
    };

    // method to get file extension
    const getFileType = (file: File) => {
        const typeData = file.type.split('/');
        return typeData[typeData.length - 1];
    };

    // method to convert file into base64 uri
    const convertFileToURI = (file: File) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(null);
        });
    };

    // handles file change
    const onFileChange = async (
        event: ChangeEvent<HTMLInputElement> | undefined,
    ) => {
        if (event) {
            const filesData: FileList | null = event.target.files;
            const fileList: Attachment[] = [];
            if (filesData) {
                const files = Array.from(filesData);
                for (const file of files) {
                    fileList.push({
                        id: generateRandomStringForId(),
                        name: file.name,
                        data: (await convertFileToURI(file)) as string,
                        isImage: isFileAImage(getFileType(file)),
                    });
                }
                props.setFiles([...props.filesSelected, ...fileList]);
            }
        }
    };

    return (
        <span className="d-flex">
            <input
                data-testid="attachments"
                id="attachments"
                className="display-none"
                type="file"
                name="attachments"
                multiple
                onChange={(e: ChangeEvent<HTMLInputElement> | undefined) =>
                    onFileChange(e)
                }
            />
            <img
                data-testid="attachment-selector"
                className="chat-svg-icon pointer-cursor"
                src={fileIcon}
                alt="file"
                onClick={() => openAttachmentSelector()}
            />
        </span>
    );
}
