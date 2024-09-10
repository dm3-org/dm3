import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export function validateSchema(schema: any, data: any) {
    let ajv = new Ajv();
    addFormats(ajv);
    try {
        const validate = ajv.compile(schema);
        return validate(data);
    } catch (error) {
        console.error('Error in validateSchema', error);
        return false;
    }
}
