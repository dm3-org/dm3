import Ajv, { KeywordCxt } from 'ajv';
import { ethers } from 'ethers';

export function validateSchema(schema: any, data: any) {
    const ajv = new Ajv();
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (e) {
        console.log(e);
        return false;
    }
}
