import { SignedUserProfile } from '../Profile';
import { DeliveryServiceProfile } from '../deliveryServiceProfile/Delivery';

export type Dm3Profile = SignedUserProfile | DeliveryServiceProfile;

export type ProfileResolver<T extends Dm3Profile> = {
    //Determines if the certain resolver is capable of resolving the according textRecord
    isProfile: (textRecord: string) => boolean;
    //resolves a textRecord to a userProfile if isProfile evaluates to true
    resolveProfile: (textRecord: string) => Promise<T>;
};
