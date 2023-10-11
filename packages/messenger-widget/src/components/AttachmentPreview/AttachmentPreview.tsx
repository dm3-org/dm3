import './AttachmentPreview.css';
import closeIcon from '../../assets/images/cross.svg';
import attachmentIcon from '../../assets/images/attachment.svg';
import { AttachmentProps } from '../../interfaces/props';

export function AttachmentPreview(props: AttachmentProps) {
    function unselectAttachment(id: string) {
        const files = props.filesSelected.filter((data) => data.id !== id);
        props.setFiles(files);
    }

    return (
        <div className="d-flex pb-2 pt-1 align-items-center">
            {props.filesSelected.map((item) => {
                return (
                    <div
                        className="d-flex background-config-box border-radius-6 
                width-fit align-items-center p-1 ms-1"
                        key={item.id}
                    >
                        <img
                            className="border-radius-3 file-preview-selected"
                            src={item.isImage ? item.data : attachmentIcon}
                            alt="file"
                        />
                        <div className="font-size-12 ms-1">{item.name}</div>
                        <img
                            className="pointer-cursor unselect-file"
                            src={closeIcon}
                            alt="unselect"
                            onClick={() => unselectAttachment(item.id)}
                        />
                    </div>
                );
            })}
        </div>
    );
}
