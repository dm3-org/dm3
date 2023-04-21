/**
 * @param request the decoded function params of the request. i.E {name:string,record:string}
 * @param signature the signature of the function the request should query
 */
export interface DecodedCcipRequest {
    request: any;
    signature: string;
}
