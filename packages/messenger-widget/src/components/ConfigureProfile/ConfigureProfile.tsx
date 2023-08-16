import './ConfigureProfile.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import tickIcon from '../../assets/images/white-tick.svg';
import deleteIcon from '../../assets/images/delete.svg';
import {
    ACTION_TYPE,
    BUTTON_CLASS,
    NAME_TYPE,
    PROFILE_INPUT_FIELD_CLASS,
    closeConfigurationModal,
} from './bl';
import { useState } from 'react';

export function ConfigureProfile() {
    // context API states
    const [address, setAddress] = useState<string | null>(
        '0x11Ee133A1408FE2d7c62296D7eB23F234b774503.address.dm3.eth',
    );

    const [originalDm3Name, setOriginalDm3Name] = useState<string | undefined>(
        undefined,
    );
    const [originalEnsName, setOriginalEnsName] = useState<string | undefined>(
        undefined,
    );

    // input field states
    const [dm3Name, setDm3Name] = useState<string>('');
    const [ensName, setEnsName] = useState<string>('');

    // error states
    const [showError, setShowError] = useState<NAME_TYPE | undefined>(
        undefined,
    );
    const [errorMsg, setErrorMsg] = useState<string>('');

    // handles name change event
    const handleNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: NAME_TYPE,
    ) => {
        setShowError(undefined);
        if (type === NAME_TYPE.DM3_NAME) {
            setDm3Name(e.target.value);
            setEnsName('');
        } else {
            setEnsName(e.target.value);
            setDm3Name('');
        }
    };

    // handles claim or delete DM3 user name
    const handleClaimOrRemoveDm3Name = (type: ACTION_TYPE) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = dm3Name.trim();
            if (!name.length) {
                setErrorMsg('DM3 name cannot be empty');
                // setErrorMsg(
                //     'Name is not available. or Name must not have blancs.',
                // );
                setShowError(NAME_TYPE.DM3_NAME);
                return;
            }
            setOriginalDm3Name(name.concat('.user.dm3.eth'));
            setDm3Name('');
            setShowError(undefined);
        } else {
            setOriginalDm3Name(undefined);
        }
    };

    // handles configure or remove ENS name
    const handlePublishOrRemoveProfile = (type: ACTION_TYPE) => {
        if (type === ACTION_TYPE.CONFIGURE) {
            const name = ensName.trim();
            if (!name.length) {
                setErrorMsg('ENS name cannot be empty');
                // setErrorMsg('You are not the owner/manager of this name.');
                setShowError(NAME_TYPE.ENS_NAME);
                return;
            }
            setOriginalEnsName(name);
            setEnsName('');
            setShowError(undefined);
        } else {
            setOriginalEnsName(undefined);
        }
    };

    return (
        <div>
            <div
                id="configuration-modal"
                className="modal-container position-fixed w-100 h-100"
            >
                <div
                    className="configuration-modal-content border-radius-6 
        background-container text-primary-color"
                >
                    {/* Header */}
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                DM3 Profile Configuration
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Your dm3 profile needs to be published. You can
                                use your own ENS name, get a DM3 name, or keep
                                your wallet address.
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => closeConfigurationModal()}
                        />
                    </div>

                    <hr className="line-separator separator text-secondary-color" />

                    <div>
                        {/* Wallet address */}
                        <div className="d-flex ps-4">
                            <div className="configuration-items-align">
                                {address && <img src={tickIcon} />}
                            </div>
                            <div className="profile-config-container">
                                <div className="d-flex">
                                    <p className="m-0 font-size-14 font-weight-500 line-height-24 title-content">
                                        Wallet Address
                                    </p>
                                    <p className="m-0 font-size-14 font-weight-500 line-height-24 grey-text">
                                        {address}
                                    </p>
                                </div>
                                <div className="address-details">
                                    <div className="small-text font-weight-300 grey-text">
                                        You can use your wallet address as a
                                        username. A virtual profile is created
                                        and stored at a dm3 service. There are
                                        no transaction costs for creation and
                                        administration.
                                    </div>
                                    <div className="small-text font-weight-700">
                                        You can receive messages sent to your
                                        wallet address.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* DM3 Name */}
                        <div className="mt-5">
                            {showError === NAME_TYPE.DM3_NAME && (
                                <div className="d-flex ps-4 align-items-center">
                                    <div className="configuration-items-align invisible">
                                        <img src={tickIcon} />
                                    </div>
                                    <p
                                        className="m-0 font-size-14 font-weight-500 line-height-24 
                                        title-content invisible"
                                    >
                                        DM3 Name
                                    </p>

                                    <div
                                        className={
                                            'conversation-error font-weight-400 ms-3 show-error'
                                        }
                                    >
                                        {errorMsg}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="d-flex ps-4 align-items-baseline">
                            <div className="configuration-items-align">
                                {originalDm3Name && <img src={tickIcon} />}
                            </div>
                            <div className="dm3-name-container">
                                <div className="d-flex align-items-center">
                                    <p className="m-0 font-size-14 font-weight-500 line-height-24 title-content">
                                        DM3 Name
                                    </p>
                                    {!originalDm3Name ? (
                                        <>
                                            <input
                                                className={PROFILE_INPUT_FIELD_CLASS.concat(
                                                    ' ',
                                                    showError ===
                                                        NAME_TYPE.DM3_NAME
                                                        ? 'err-background'
                                                        : '',
                                                )}
                                                type="text"
                                                value={dm3Name}
                                                placeholder="Enter your preferred name and check availability"
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) =>
                                                    handleNameChange(
                                                        e,
                                                        NAME_TYPE.DM3_NAME,
                                                    )
                                                }
                                            />
                                            <p
                                                className="mb-0 ms-1 font-size-14 font-weight-500 
                                            line-height-24 grey-text"
                                            >
                                                .user.dm3.eth
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <p
                                                className="m-0 font-size-14 font-weight-500 line-height-24 
                                            grey-text d-flex"
                                            >
                                                {originalDm3Name}
                                                <img
                                                    className="ms-4 pointer-cursor"
                                                    src={deleteIcon}
                                                    alt="remove"
                                                    onClick={() =>
                                                        handleClaimOrRemoveDm3Name(
                                                            ACTION_TYPE.REMOVE,
                                                        )
                                                    }
                                                />
                                            </p>
                                        </>
                                    )}
                                </div>
                                <div className="mt-3 dm3-name-content">
                                    <div className="small-text font-weight-300 grey-text">
                                        You can get a DM3 name for free. Please
                                        check if your desired name is available.
                                        DM3 names are created and managed on
                                        Layer2 (e.g. Optimism). Small
                                        transaction costs will apply for setting
                                        the profile and administration.
                                    </div>
                                    <div className="small-text font-weight-700">
                                        You can receive messages sent to your
                                        full DM3 username.
                                    </div>
                                </div>
                            </div>
                            <div>
                                {!originalDm3Name && (
                                    <button
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
                                            )
                                        }
                                    >
                                        Claim & Publish
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* ENS Name */}
                        <div className="mt-5">
                            {showError === NAME_TYPE.ENS_NAME && (
                                <div className="d-flex ps-4 align-items-center">
                                    <div className="configuration-items-align invisible">
                                        <img src={tickIcon} />
                                    </div>
                                    <p
                                        className="m-0 font-size-14 font-weight-500 line-height-24 
                                        title-content invisible"
                                    >
                                        ENS Name
                                    </p>

                                    <div
                                        className={
                                            'conversation-error font-weight-400 ms-3 show-error'
                                        }
                                    >
                                        {errorMsg}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="d-flex ps-4 pb-3 align-items-baseline">
                            <div className="configuration-items-align">
                                {originalEnsName && <img src={tickIcon} />}
                            </div>
                            <div className="dm3-name-container">
                                <div className="d-flex align-items-center">
                                    <p className="m-0 font-size-14 font-weight-500 line-height-24 title-content">
                                        ENS Name
                                    </p>
                                    {!originalEnsName ? (
                                        <input
                                            className={PROFILE_INPUT_FIELD_CLASS.concat(
                                                ' ',
                                                showError === NAME_TYPE.ENS_NAME
                                                    ? 'err-background'
                                                    : '',
                                            )}
                                            type="text"
                                            value={ensName}
                                            placeholder="Enter your ENS name. It must be connected to your wallet"
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                handleNameChange(
                                                    e,
                                                    NAME_TYPE.ENS_NAME,
                                                )
                                            }
                                        />
                                    ) : (
                                        <p className="m-0 font-size-14 font-weight-500 line-height-24 grey-text">
                                            {originalEnsName}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-3 dm3-name-content">
                                    <div className="small-text font-weight-300 grey-text">
                                        To publish your dm3 profile, a
                                        transaction is sent to set a text record
                                        in your ENS name. Transaction costs will
                                        apply for setting the profile and
                                        administration.
                                    </div>
                                    <div className="small-text font-weight-700">
                                        You can receive dm3 messages directly
                                        sent to your ENS name.
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button
                                    disabled={
                                        !originalEnsName &&
                                        (!ensName || !ensName.length)
                                    }
                                    className={BUTTON_CLASS.concat(
                                        ' ',
                                        !originalEnsName &&
                                            (!ensName || !ensName.length)
                                            ? 'modal-btn-disabled'
                                            : 'modal-btn-active',
                                    )}
                                    onClick={() =>
                                        handlePublishOrRemoveProfile(
                                            originalEnsName
                                                ? ACTION_TYPE.REMOVE
                                                : ACTION_TYPE.CONFIGURE,
                                        )
                                    }
                                >
                                    {!originalEnsName
                                        ? ' Publish Profile'
                                        : 'Rename Profile'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
