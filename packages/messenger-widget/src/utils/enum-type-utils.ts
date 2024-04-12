export enum ButtonState {
    Ideal,
    Failed,
    Loading,
    Success,
    Disabled,
}

export enum RightViewSelected {
    Chat,
    ContactInfo,
    Profile,
    Default,
}

export enum LeftViewSelected {
    Contacts,
    Menu,
}

export enum MessageActionType {
    NEW = 'NEW',
    EDIT = 'EDIT',
    DELETE = 'DELETE_REQUEST',
    REPLY = 'REPLY',
    REACT = 'REACTION',
    NONE = 'NONE',
}

export enum SiweValidityStatus {
    TO_BE_INITIATED = 'TO_BE_INITIATED',
    IN_PROGRESS = 'IN_PROGRESS',
    VALIDATED = 'VALIDATED',
    ERROR = 'ERROR',
}
