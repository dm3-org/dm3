import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';
import { Contact } from './context';
import humanIcon from '../assets/images/human.svg';

export interface EnsProfileDetails {
    email: string | null;
    github: string | null;
    twitter: string | null;
}

export interface IButton {
    buttonText: string;
    actionMethod: Function;
}

export interface ContactPreview {
    name: string;
    message: string | null;
    image: string;
    unreadMsgCount: number;
    messageCount: number;
    contactDetails: Contact;
    isHidden: boolean;
}

export interface IContactInfo {
    name: string;
    address: string;
    image: string;
}

export interface NewContact {
    active: boolean;
    ensName: string | undefined;
    processed: boolean;
}

export interface Attachment {
    id: string;
    data: string;
    name: string;
    isImage: boolean;
}

export const getDefaultContract = (ensName: string) => {
    const newContact: ContactPreview = {
        name: getAccountDisplayName(ensName, 25),
        message: null,
        image: humanIcon,
        unreadMsgCount: 0,
        messageCount: 0,
        contactDetails: {
            account: {
                ensName,
            },
            deliveryServiceProfile: undefined,
        },
        isHidden: false,
    };

    return newContact;
};
