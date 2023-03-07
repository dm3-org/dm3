import SignedUserProfileSchema from '../../schema/SignedUserProfile.schema.json';
import Ajv from 'ajv';
import { SignedUserProfile } from '../Account';

export function validateSignedUserProfile(
    userProfile: SignedUserProfile,
): boolean {
    const ajv = new Ajv();
    const validate = ajv.compile(SignedUserProfileSchema);
    return !!validate(userProfile);
}
