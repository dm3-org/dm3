import { getAccountDisplayName } from '@dm3-org/dm3-lib-profile';
import { Contact } from './context';
import humanIcon from '../assets/images/human.svg';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

export interface Connection {
    socket?: Socket<DefaultEventsMap, DefaultEventsMap>;
    defaultServiceUrl: string;
}

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
    contactDetails: Contact;
    isHidden: boolean;
    messageSizeLimit: number;
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

export interface IAttachmentPreview {
    id: string;
    data: string;
    name: string;
    isImage: boolean;
}

export const getEmptyContact = (
    ensName: string,
    message: string | null,
    isHidden: boolean = false,
) => {
    const newContact: ContactPreview = {
        name: getAccountDisplayName(ensName, 25),
        message,
        image: humanIcon,
        contactDetails: {
            account: {
                ensName,
            },
            deliveryServiceProfiles: [],
        },
        isHidden,
        messageSizeLimit: 0,
    };

    return newContact;
};
