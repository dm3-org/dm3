import {
    createEditMessage,
    createMessage,
    createReplyMessage,
    SendDependencies,
} from 'dm3-lib-messaging';
import {
    Actions,
    GlobalState,
    MessageActionType,
    UiViewStateType,
} from '../../utils/enum-type-utils';
import {
    getHaltDelivery,
    getDependencies,
    sendMessage,
} from '../../utils/common-utils';

const handleNewUserMessage = async (
    message: string,
    setMessage: Function,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const messageData = await createMessage(
        state.accounts.selectedContact.account.ensName,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey,
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

    setMessage('');
};

export const handleSubmit = async (
    message: string,
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    setMessage: Function,
    event:
        | React.FormEvent<HTMLFormElement>
        | React.MouseEvent<HTMLImageElement, MouseEvent>,
) => {
    event.preventDefault();

    if (!message.trim().length) {
        return;
    }

    if (
        state.uiView.selectedMessageView.actionType === MessageActionType.EDIT
    ) {
        await editMessage(state, dispatch, message, setMessage);
    } else if (
        state.uiView.selectedMessageView.actionType === MessageActionType.REPLY
    ) {
        await replyMessage(state, dispatch, message, setMessage);
    } else {
        await handleNewUserMessage(message, setMessage, state, dispatch);
    }
};

const editMessage = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    message: string,
    setMessage: Function,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const referenceMessageHash =
        state.uiView.selectedMessageView.messageData?.envelop.metadata
            ?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // edit the original message
    const messageData = await createEditMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
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

    setMessage('');
};

const replyMessage = async (
    state: GlobalState,
    dispatch: React.Dispatch<Actions>,
    message: string,
    setMessage: Function,
) => {
    const userDb = state.userDb;

    if (!userDb) {
        throw Error('userDB not found');
    }

    if (!state.accounts.selectedContact) {
        throw Error('no contact selected');
    }

    const referenceMessageHash =
        state.uiView.selectedMessageView.messageData?.envelop.metadata
            ?.encryptedMessageHash;

    dispatch({
        type: UiViewStateType.SetMessageView,
        payload: {
            actionType: MessageActionType.NONE,
            messageData: undefined,
        },
    });

    // reply to the original message
    const messageData = await createReplyMessage(
        state.accounts.selectedContact?.account.ensName as string,
        state.connection.account!.ensName,
        message,
        userDb.keys.signingKeyPair.privateKey as string,
        referenceMessageHash as string,
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

    setMessage('');
};
