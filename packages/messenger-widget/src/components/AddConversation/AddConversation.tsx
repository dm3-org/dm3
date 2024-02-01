/* eslint-disable no-console */
import './AddConversation.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { INPUT_FIELD_CLASS, closeConversationModal } from './bl';
import { FormEvent, useContext, useState } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import { showContactList } from '../../utils/common-utils';
import { ethers } from 'ethers';
import { AuthContext } from '../../context/AuthContext';
import { useTopLevelAlias } from '../../hooks/topLevelAlias/useTopLevelAlias';
import { ConversationContext } from '../../context/ConversationContext';
import {
    LeftViewSelected,
    ModalStateType,
    RightViewSelected,
    UiViewStateType,
    UserDbType,
} from '../../utils/enum-type-utils';
import { closeLoader, startLoader } from '../Loader/Loader';

export default function AddConversation() {
    const { state, dispatch } = useContext(GlobalContext);
    const { addConversation, setSelectedContactName } =
        useContext(ConversationContext);

    const [name, setName] = useState<string>('');
    const [showError, setShowError] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [inputClass, setInputClass] = useState<string>(INPUT_FIELD_CLASS);
    const { resolveTLDtoAlias } = useTopLevelAlias();

    const { ethAddress } = useContext(AuthContext);

    // handles new contact submission
    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setName(name.trim());
        console.log('name', name);
        if (name.length) {
            // start loader
            dispatch({
                type: ModalStateType.LoaderContent,
                payload: 'Adding contact...',
            });

            startLoader();

            const ensNameIsInvalid =
                ethAddress &&
                name.split('.')[0] &&
                ethAddress.toLowerCase() === name.split('.')[0].toLowerCase();

            if (ensNameIsInvalid) {
                setErrorMsg('Please enter valid ENS name');
                setShowError(true);
                return;
            }
            //Checks wether the name entered, is an tld name. If yes, the TLD is substituded with the alias name

            const aliasName = await resolveTLDtoAlias(name);
            closeConversationModal(
                resetName,
                showErrorMessage,
                resetInputFieldClass,
            );
            const addConversationData = {
                active: true,
                ensName: aliasName,
                processed: false,
            };

            // set new contact data
            dispatch({
                type: ModalStateType.AddConversationData,
                payload: addConversationData,
            });

            // set left view to contacts
            dispatch({
                type: UiViewStateType.SetSelectedLeftView,
                payload: LeftViewSelected.Contacts,
            });

            // set right view to chat
            dispatch({
                type: UiViewStateType.SetSelectedRightView,
                payload: RightViewSelected.Chat,
            });

            const newContact = await addConversation(aliasName);
            setSelectedContactName(newContact.name);
            closeLoader();

            // close the modal
        } else {
            setErrorMsg('Please enter valid ENS name');
            setShowError(true);
        }
    };

    // handles name change event
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setErrorMsg('');
        setShowError(false);
        setName(e.target.value);
        if (!ethers.utils.isValidName(e.target.value)) {
            setErrorMsg('Invalid address or ENS name');
            setShowError(true);
        }
    };

    // resets name to default
    const resetName = () => {
        setName('');
    };

    // sets error message whether to show or not
    const showErrorMessage = (value: boolean, content: string) => {
        setErrorMsg(content);
        setShowError(value);
    };

    // resets class to default
    const resetInputFieldClass = () => {
        setInputClass(INPUT_FIELD_CLASS);
    };

    return (
        <div>
            <div
                id="conversation-modal"
                className="modal-container display-none position-fixed w-100 h-100"
            >
                <div
                    className="conversation-modal-content border-radius-6 
                background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                Add Conversation
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                Add or reactivate a conversation with a web3
                                name.
                            </div>
                        </div>
                        <img
                            className="close-modal-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => {
                                closeConversationModal(
                                    resetName,
                                    showErrorMessage,
                                    resetInputFieldClass,
                                );
                                showContactList(dispatch);
                            }}
                        />
                    </div>

                    <hr className="line-separator separator text-secondary-color" />

                    <form
                        onSubmit={(e: React.FormEvent) => submit(e)}
                        className="mt-4 mb-2 d-flex"
                    >
                        <div className="pe-3">
                            <div className="d-flex align-items-center">
                                <label
                                    htmlFor="name"
                                    className="font-size-14 font-weight-500 invisible"
                                >
                                    Name
                                </label>
                                <div
                                    className={'conversation-error font-weight-400 ms-3'.concat(
                                        ' ',
                                        showError ? 'show-error' : 'hide-error',
                                    )}
                                >
                                    {errorMsg}
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <label
                                    htmlFor="name"
                                    className="font-size-14 font-weight-500"
                                >
                                    Name
                                </label>
                                <input
                                    id="add-conv-input"
                                    className={inputClass.concat(
                                        ' ',
                                        showError ? 'err-background' : '',
                                    )}
                                    type="text"
                                    placeholder="Enter the name or address of the contact"
                                    value={name}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => handleNameChange(e)}
                                />
                            </div>

                            <p className="conversation-description font-weight-300">
                                Enter the web3 name or the address (the reverse
                                lookup should be configured) of the contact you
                                want to start a conversation. If the recipient
                                has not yet published his/her dm3 profile,
                                messages will be stored and sent later.
                            </p>
                        </div>
                        <div>
                            <button
                                disabled={!name || !name.length || showError}
                                className={'add-btn font-weight-400 font-size-12 border-radius-4 line-height-24'.concat(
                                    ' ',
                                    !name || !name.length || showError
                                        ? 'modal-btn-disabled'
                                        : 'modal-btn-active',
                                )}
                                onClick={(e: FormEvent) => submit(e)}
                            >
                                Add
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
