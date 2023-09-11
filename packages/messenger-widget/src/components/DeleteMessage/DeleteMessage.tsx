import './DeleteMessage.css';
import '../../styles/modal.css';
import closeIcon from '../../assets/images/cross.svg';
import { useContext } from 'react';
import { GlobalContext } from '../../utils/context-utils';
import {
    MessageActionType,
    ModalStateType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    getDependencies,
    getHaltDelivery,
    sendMessage,
} from '../../utils/common-utils';
import {
    SendDependencies,
    createDeleteRequestMessage,
} from 'dm3-lib-messaging';

export default function DeleteMessage() {
    const { state, dispatch } = useContext(GlobalContext);

    const closeModal = () => {
        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });
    };

    const deleteMessage = async () => {
        const userDb = state.userDb;

        if (!userDb) {
            throw Error('userDB not found');
        }

        if (!state.accounts.selectedContact) {
            throw Error('no contact selected');
        }

        const messageHash =
            state.uiView.selectedMessageView.messageData?.envelop.metadata
                ?.encryptedMessageHash;

        dispatch({
            type: UiViewStateType.SetMessageView,
            payload: {
                actionType: MessageActionType.NONE,
                messageData: undefined,
            },
        });

        // delete the message
        const messageData = await createDeleteRequestMessage(
            state.accounts.selectedContact?.account.ensName as string,
            state.connection.account!.ensName,
            userDb.keys.signingKeyPair.privateKey as string,
            messageHash as string,
        );

        const haltDelivery = getHaltDelivery(state);
        const sendDependencies: SendDependencies = getDependencies(state);

        await sendMessage(
            state,
            sendDependencies,
            messageData,
            haltDelivery,
            dispatch,
        );

        dispatch({
            type: ModalStateType.LastMessageAction,
            payload: MessageActionType.EDIT,
        });
    };

    return (
        <div>
            <div className="modal-container position-fixed w-100 h-100">
                <div
                    className="delete-msg-modal-content border-radius-6 
        background-container text-primary-color"
                >
                    <div className="d-flex align-items-start">
                        <div className="width-fill">
                            <h4 className="font-weight-800 mb-1">
                                Delete Message
                            </h4>
                            <div className="font-weight-500 font-size-12">
                                This message will be deleted from your inbox and
                                a request for deletion will be sent to the other
                                person.
                            </div>
                        </div>
                        <img
                            className="preferences-close-icon"
                            src={closeIcon}
                            alt="close"
                            onClick={() => closeModal()}
                        />
                    </div>

                    <hr className="line-separator preferences-separator text-secondary-color" />

                    <div className="d-flex justify-content-center">
                        <button
                            className="delete-msg-btn font-weight-400 font-size-12 border-radius-4 
                            line-height-24 modal-btn-active"
                            onClick={() => deleteMessage()}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
