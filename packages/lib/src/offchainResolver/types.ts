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
