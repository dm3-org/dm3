import { ethers } from 'ethers';

export enum NAME_TYPE {
    ENS_NAME,
    DM3_NAME,
    OP_NAME,
}

export enum ACTION_TYPE {
    CONFIGURE,
    REMOVE,
}

export const PROFILE_INPUT_FIELD_CLASS =
    'profile-input font-weight-400 font-size-14 border-radius-6 line-height-24';

export const BUTTON_CLASS =
    'configure-btn font-weight-400 font-size-12 border-radius-4 line-height-24';

export interface IChain {
    chainToConnect: number;
}

export const validateEnsName = (username: string): boolean => {
    return ethers.utils.isValidName(username);
};
