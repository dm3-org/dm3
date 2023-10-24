import './DeleteDM3Name.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { DeleteDM3NameProps } from '../../interfaces/props';
import { ACTION_TYPE } from '../ConfigureProfile/bl';

export default function DeleteDM3Name(props: DeleteDM3NameProps) {
    return (
        <div>
            <div className="modal-container position-fixed w-100 h-100">
                <div
                    className="delete-name-modal-content border-radius-6 
        background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                Delete DM3 Name
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Are you sure you want to delete the DM3 name? If
                                yes please click on delete button to confirm and
                                delete the DM3 name
                            </div>
                        </div>
                        <img
                            className="preferences-close-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() =>
                                props.setDeleteDM3NameConfirmation(false)
                            }
                        />
                    </div>

                    <hr className="line-separator preferences-separator text-secondary-color" />

                    <div className="d-flex justify-content-center">
                        <button
                            className="delete-name-btn font-weight-400 font-size-12 border-radius-4 
                            line-height-24 modal-btn-active"
                            onClick={() =>
                                props.removeDm3Name(ACTION_TYPE.REMOVE)
                            }
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
