import { UserProfile } from './../account';
//TODO add proper description and response
export interface CiipResponse {
    userProfile: UserProfile;
    validUntil: number;
    sig: string;
}

/**
 * @param name the ENS name after after decoding
 * @param record the name of the record that should be queried
 * @param signature the signature of the function the request should query
 */
export interface DecodedCcipRequest {
    name: string;
    record: string;
    signature: string;
}
