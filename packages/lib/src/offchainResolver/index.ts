export type { OffchainUserProfile } from './OffchainUserProfile';

export { signProfile } from './signProfile/signProfile';
export { decodeCalldata } from './resolve/decodeCalldata';
export { encodeUserProfile } from './resolve/encodeUserProfile';
export { resolveWithProof } from './resolve/resolveWithProof';
export type {
    CiipResponse as ResolveResponse,
    DecodedCcipRequest,
} from './resolve/types';
