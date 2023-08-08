import { Contact } from './context';

export interface EnsProfileDetails {
    email: string | null;
    github: string | null;
    twitter: string | null;
}

export interface Button {
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
