import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import DeleteDM3Name from '../../DeleteDM3Name/DeleteDM3Name';
import { ConfigureDM3NameContext } from '../context/ConfigureDM3NameContext';
import { ConfigureProfileContext } from '../context/ConfigureProfileContext';
import {
    ACTION_TYPE,
    BUTTON_CLASS,
    NAME_TYPE,
    PROFILE_INPUT_FIELD_CLASS,
} from '../chain/common';
import deleteIcon from '../../../assets/images/delete.svg';

export const MobileView = ({
    nameExtension,
    placeholder,
    submitDm3UsernameClaim,
}: {
    nameExtension: string;
    placeholder: string;
    submitDm3UsernameClaim: (dm3UserEnsName: string) => void;
}) => {
    const { setDisplayName } = useContext(AuthContext);

    const { errorMsg, showError } = useContext(ConfigureProfileContext);

    const {
        dm3Name,
        existingDm3Name,
        showDeleteConfirmation,
        handleNameChange,
        handleClaimOrRemoveDm3Name,
        updateDeleteConfirmation,
        setShowDeleteConfirmation,
    } = useContext(ConfigureDM3NameContext);

    return (
        <div className="d-flex ps-2 align-items-baseline">
            {/* Delete DM3 name confirmation popup modal */}
            {showDeleteConfirmation && (
                <DeleteDM3Name
                    setDeleteDM3NameConfirmation={updateDeleteConfirmation}
                    removeDm3Name={handleClaimOrRemoveDm3Name}
                />
            )}
            <div className="dm3-name-container">
                <div className="d-flex flex-column">
                    <p
                        className="m-0 
                    font-size-14 font-weight-500 line-height-24 title-content"
                    >
                        DM3 Name
                    </p>
                    <div
                        className={
                            'conversation-error font-weight-400 ms-3 show-error'
                        }
                    >
                        {showError === NAME_TYPE.DM3_NAME && errorMsg}
                    </div>
                    {!existingDm3Name ? (
                        <form
                            className="pe-2"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleClaimOrRemoveDm3Name(
                                    ACTION_TYPE.CONFIGURE,
                                    setDisplayName,
                                    submitDm3UsernameClaim,
                                );
                            }}
                        >
                            <input
                                data-testid="dm3-name"
                                className={PROFILE_INPUT_FIELD_CLASS.concat(
                                    ' ',
                                    showError === NAME_TYPE.DM3_NAME
                                        ? 'err-background'
                                        : '',
                                )}
                                type="text"
                                value={dm3Name}
                                placeholder={placeholder}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => handleNameChange(e, NAME_TYPE.DM3_NAME)}
                            />
                            <p
                                className="mb-0 ms-1 font-size-14 font-weight-500 
                line-height-24 grey-text"
                            >
                                {nameExtension}
                            </p>
                        </form>
                    ) : (
                        <>
                            <p
                                className="m-0 font-size-14 font-weight-500 line-height-24 
                grey-text d-flex align-items-center"
                            >
                                {existingDm3Name}
                                <img
                                    className="ms-4 pointer-cursor"
                                    src={deleteIcon}
                                    alt="remove"
                                    onClick={() =>
                                        setShowDeleteConfirmation(true)
                                    }
                                />
                            </p>
                        </>
                    )}
                </div>
                <div className="mt-2">
                    {!existingDm3Name && (
                        <button
                            data-testid="claim-publish"
                            disabled={!dm3Name || !dm3Name.length}
                            className={BUTTON_CLASS.concat(
                                ' ',
                                !dm3Name || !dm3Name.length
                                    ? 'modal-btn-disabled'
                                    : 'modal-btn-active',
                            )}
                            onClick={() =>
                                handleClaimOrRemoveDm3Name(
                                    ACTION_TYPE.CONFIGURE,
                                    setDisplayName,
                                    submitDm3UsernameClaim,
                                )
                            }
                        >
                            Claim & Publish
                        </button>
                    )}
                </div>
                <div className="mt-3 dm3-name-content">
                    <div className="small-text font-weight-300 grey-text">
                        You can get a DM3 name for free. Please check if your
                        desired name is available. DM3 names are created and
                        managed on Layer2 (e.g. Optimism). Small transaction
                        costs will apply for setting the profile and
                        administration.
                    </div>
                    <div className="small-text font-weight-700">
                        You can receive messages sent to your full DM3 username.
                    </div>
                </div>
            </div>
        </div>
    );
};
