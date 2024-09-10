import { NotificationChannelType } from '@dm3-org/dm3-lib-shared';

export interface IVerificationModal {
    heading: string;
    description: string;
    type: NotificationChannelType;
    placeholder: string;
    content: string;
    action: Function;
    setVerification: Function;
}

export const getVerficationModalContent = (
    type: NotificationChannelType,
    action: Function,
    setVerification: Function,
): IVerificationModal => {
    const emailContent: IVerificationModal = {
        heading: 'Add Email',
        description: 'Add and verify email address for dm3 notifications.',
        type: NotificationChannelType.EMAIL,
        placeholder: 'Enter your email address.',
        content:
            'Please enter your email address! To verify the ownership of ' +
            'your email address, you will receive an email containing a verification code.',
        action: action,
        setVerification: setVerification,
    };

    // const phoneContent: IVerificationModal = {
    //     heading: 'Add Telephone',
    //     description: 'Add and verify telephone number for dm3 notifications.',
    //     type: VerificationMethod.Telephone,
    //     placeholder: 'Enter your telephone number.',
    //     content:
    //         'Please enter your telephone number! To verify the ownership of your telephone ' +
    //         'number, you will receive a SMS containing a verification code.',
    //     action: action,
    //     setVerification: setVerification,
    // };

    switch (type) {
        case NotificationChannelType.EMAIL:
            return emailContent;
        // case VerificationMethod.Telephone:
        //     return phoneContent;
        default:
            return emailContent;
    }
};
