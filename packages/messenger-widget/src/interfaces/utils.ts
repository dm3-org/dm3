import { Contact } from './context';

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
}

export interface ContactInfo {
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
