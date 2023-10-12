import closeIcon from '../../assets/images/cross.svg';
import { ImageModal } from '../../interfaces/props';

export function ImageViewModal(props: ImageModal) {
    return (
        <div
            data-testid="image-view-modal"
            className="modal-container position-fixed w-100 h-100"
        >
            <div className="d-flex justify-content-center align-items-center height-fill">
                <div className="d-flex align-items-start">
                    <img
                        data-testid="image-modal"
                        src={props.uri}
                        alt="image"
                        style={{ maxHeight: '80vh' }}
                    />
                    <img
                        data-testid="close-img"
                        className="preferences-close-icon"
                        src={closeIcon}
                        alt="close"
                        onClick={() => props.setUri(null)}
                    />
                </div>
            </div>
        </div>
    );
}
