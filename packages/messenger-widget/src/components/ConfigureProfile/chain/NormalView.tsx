import { useContext } from 'react';
import tickIcon from '../../../assets/images/white-tick.svg';
import { ConfigureProfileContext } from '../context/ConfigureProfileContext';
import {
    ACTION_TYPE,
    NAME_TYPE,
    PROFILE_INPUT_FIELD_CLASS,
    BUTTON_CLASS,
} from './common';

export const NormalView = ({
    propertyName,
    label,
    note,
    placeholder,
    onSubmitTx,
    handleNameChange,
}: {
    propertyName: string;
    label: string;
    note: string;
    placeholder: string;
    onSubmitTx: (name: string) => void;
    handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
    const {
        showError,
        ensName,
        onShowError,
        errorMsg,
        existingEnsName,
        setExistingEnsName,
    } = useContext(ConfigureProfileContext);

    // handles configure or remove ENS name
    const handlePublishOrRemoveProfile = async (type: ACTION_TYPE) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = ensName.trim();
            if (!name.length) {
                onShowError(NAME_TYPE.ENS_NAME, 'ENS name cannot be empty');
                return;
            }
            onSubmitTx(name);
        } else {
            setExistingEnsName(null);
        }
    };
    return (
        <>
            {/* ENS Name */}
            <div>
                <div className="d-flex ps-4 align-items-center">
                    <div className="configuration-items-align invisible">
                        <img src={tickIcon} />
                    </div>
                    <p
                        className="m-0 font-size-14 font-weight-500 line-height-24 
                                        title-content invisible"
                    >
                        {propertyName}
                    </p>

                    <div
                        className={
                            'conversation-error font-weight-400 ms-3 show-error'
                        }
                    >
                        {showError === NAME_TYPE.ENS_NAME && errorMsg}
                    </div>
                </div>
            </div>

            <div className="d-flex ps-4 pb-3 align-items-baseline">
                <div className="configuration-items-align">
                    {existingEnsName && <img src={tickIcon} />}
                </div>
                <div className="dm3-name-container">
                    <div className="d-flex align-items-center">
                        <p className="m-0 font-size-14 font-weight-500 line-height-24 title-content">
                            {propertyName}
                        </p>
                        {!existingEnsName ? (
                            <form
                                className="d-flex width-fill"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handlePublishOrRemoveProfile(
                                        existingEnsName
                                            ? ACTION_TYPE.REMOVE
                                            : ACTION_TYPE.CONFIGURE,
                                    );
                                }}
                            >
                                <input
                                    data-testid="ens-name"
                                    className={PROFILE_INPUT_FIELD_CLASS.concat(
                                        ' ',
                                        showError === NAME_TYPE.ENS_NAME
                                            ? 'err-background'
                                            : '',
                                    )}
                                    type="text"
                                    value={ensName}
                                    placeholder={placeholder}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => handleNameChange(e)}
                                />
                            </form>
                        ) : (
                            <p className="m-0 font-size-14 font-weight-500 line-height-24 grey-text">
                                {existingEnsName}
                            </p>
                        )}
                    </div>
                    <div className="mt-3 dm3-name-content">
                        <div className="small-text font-weight-300 grey-text">
                            {label}
                        </div>
                        <div className="small-text font-weight-700">{note}</div>
                    </div>
                </div>
                <div className="me-3">
                    {!existingEnsName && (
                        <button
                            data-testid="publish-profile"
                            disabled={
                                !existingEnsName &&
                                (!ensName || !ensName.length)
                            }
                            className={BUTTON_CLASS.concat(
                                ' ',
                                !existingEnsName &&
                                    (!ensName || !ensName.length)
                                    ? 'modal-btn-disabled'
                                    : 'modal-btn-active',
                            )}
                            onClick={() =>
                                handlePublishOrRemoveProfile(
                                    existingEnsName
                                        ? ACTION_TYPE.REMOVE
                                        : ACTION_TYPE.CONFIGURE,
                                )
                            }
                        >
                            {!existingEnsName
                                ? ' Publish Profile'
                                : 'Rename Profile'}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
