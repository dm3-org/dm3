import { Envelop, MessageState } from 'dm3-lib-messaging';
import {
    Actions,
    GlobalState,
    MessageActionType,
} from '../utils/enum-type-utils';
import { Config, Dm3Props } from './config';
import { ContactPreview } from './utils';

export interface DashboardProps {
    getContacts: (
        state: GlobalState,
        dispatch: React.Dispatch<Actions>,
        props: Config,
    ) => Promise<void>;
    dm3Props: Dm3Props;
}

export interface EnsDetails {
    propertyKey: string;
    propertyValue: string;
}

export interface ContactMenu {
    contactDetails: ContactPreview;
    index: number;
}

export interface MessageProps {
    message: string;
    time: string;
    messageState: MessageState;
    ownMessage: boolean;
    envelop: Envelop;
    replyToMsg: string | undefined;
    replyToMsgFrom: string | undefined;
    reactions: Envelop[];
    isLastMessage?: boolean;
}

export interface MessageAction {
    messageData: MessageProps | undefined;
    actionType: MessageActionType;
}

export interface EmojiProps {
    message: string;
    setMessage: Function;
}
