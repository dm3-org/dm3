<<<<<<< HEAD
=======
import winston from 'winston';
declare global {
    var logger: winston.Logger;
}

>>>>>>> 4bdf0d7f5a0bb95b948c66e6c6ba098ec114ddec
export { getProfileContainer } from './getProfileContainer';
export { getProfileContainerByAddress } from './getProfileContainerByAddress';
export { removeUserProfile } from './removeUserProfile';
export { setAlias } from './setAlias';
export { getProfileContainerForAlias } from './getProfileContainerForAlias';
export { setUserProfile } from './setUserProfile';
