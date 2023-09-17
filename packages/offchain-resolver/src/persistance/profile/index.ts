import winston from 'winston';
declare global {
    var logger: winston.Logger;
}

export { getProfileContainer } from './getProfileContainer';
export { getProfileContainerByAddress } from './getProfileContainerByAddress';
export { removeUserProfile } from './removeUserProfile';
export { setAlias } from './setAlias';
export { getProfileContainerForAlias } from './getProfileContainerForAlias';
export { setUserProfile } from './setUserProfile';
export { getProfileAliasByAddress } from './getProfileAliasByAddress';
