import { SignedUserProfile } from '../Account';

//Maybe move this to shared
export interface DeliveryServiceProfile {
    publicSigningKey: string;
    publicEncryptionKey: string;
    url: string;
}

export type Dm3Profile = SignedUserProfile | DeliveryServiceProfile;

export type ProfileResolver<T extends Dm3Profile> = {
    //Determines if the certain resolver is capable of resolving the according textRecord
    isProfile: (textRecord: string) => boolean;
    //resolves a textRecord to a userProfile if isProfile evaluates to true
    resolveProfile: (textRecord: string) => Promise<T>;
};
