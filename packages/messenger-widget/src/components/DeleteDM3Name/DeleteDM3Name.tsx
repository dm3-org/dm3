import './DeleteDM3Name.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { DeleteDM3NameProps } from '../../interfaces/props';
import { ACTION_TYPE } from '../ConfigureProfile/chain/common';
import { useContext, useEffect, useState } from 'react';
import { ConfigureDM3NameContext } from '../ConfigureProfile/context/ConfigureDM3NameContext';
import { useChainId, useSwitchNetwork } from 'wagmi';
import { AuthContext } from '../../context/AuthContext';

export default function DeleteDM3Name(props: DeleteDM3NameProps) {
    const [error, setError] = useState<string>('');

    // handles delete method call only when delete button is pressed
    const [deleteInitiated, setDeleteInitiated] = useState<boolean>(false);

    const chainId = useChainId();

    const { switchNetwork } = useSwitchNetwork();

    const { setDisplayName } = useContext(AuthContext);

    const { getChainOfDm3Name } = useContext(ConfigureDM3NameContext);

    // initiates deleting of DM3 name once network is changed
    useEffect(() => {
        // if chain is changed & delete process is initiated by user, not on load of modal
        if (deleteInitiated) {
            deleteName();
        }
    }, [chainId]);

    const deleteName = async () => {
        setDeleteInitiated(true);
        const chainToConnect = getChainOfDm3Name();
        if (chainToConnect && chainToConnect !== chainId && switchNetwork) {
            switchNetwork(chainToConnect);
        } else {
            const result = await props.removeDm3Name(
                ACTION_TYPE.REMOVE,
                setDisplayName,
            );
            if (result.status) {
                props.setDeleteDM3NameConfirmation(false);
            } else {
                setError(result.error);
            }
        }
    };

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
                            onClick={async () => deleteName()}
                        >
                            Delete
                        </button>
                    </div>

                    {error.length > 0 && (
                        <div className="error-text small text-center mt-2">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
