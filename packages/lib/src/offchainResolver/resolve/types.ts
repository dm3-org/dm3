import { UserProfile } from '../../account';

export interface ResolveResponse {
    userProfile: UserProfile;
    validUntil: number;
    sig: string;
}
